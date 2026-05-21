import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  KAKAO_OAUTH_STATE_COOKIE,
  KAKAO_PENDING_SIGNUP_COOKIE,
  USER_SESSION_COOKIE,
  createSessionToken,
  getKakaoClientSecret,
  getKakaoRestApiKey,
  getUserSessionMaxAgeSeconds,
  type UserSession,
} from '@/lib/user-auth'
import { generateNickname, isNicknameAnimal, type NicknameAnimal } from '@/lib/nickname'

const KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token'
const KAKAO_USER_URL = 'https://kapi.kakao.com/v2/user/me'
const FALLBACK_REDIRECT_PATH = '/map'

interface KakaoTokenResponse {
  access_token?: string
  token_type?: string
  error?: string
  error_description?: string
}

interface KakaoUserResponse {
  id?: number
  kakao_account?: {
    profile?: {
      nickname?: string
      profile_image_url?: string
    }
  }
}

interface DatabaseUser {
  id: string
  kakao_id: string
  nickname: string
  profile_image_url: string | null
  site_nickname: string
  site_animal: NicknameAnimal
}

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get('state')
  const code = request.nextUrl.searchParams.get('code')
  const storedState = request.cookies.get(KAKAO_OAUTH_STATE_COOKIE)?.value
  const redirectTarget = new URL(FALLBACK_REDIRECT_PATH, request.nextUrl.origin)

  if (!code || !state || !storedState || state !== storedState) {
    redirectTarget.searchParams.set('auth', 'failed')
    return NextResponse.redirect(redirectTarget)
  }

  try {
    const redirectUri = getRedirectUri(request)
    const accessToken = await requestKakaoAccessToken(code, redirectUri)
    const kakaoUser = await requestKakaoUser(accessToken)
    const pendingProfile = parsePendingSignupCookie(request.cookies.get(KAKAO_PENDING_SIGNUP_COOKIE)?.value)
    const user = await upsertKakaoUser(kakaoUser, pendingProfile)
    const session: UserSession = {
      userId: user.id,
      kakaoId: user.kakao_id,
      nickname: user.nickname,
      profileImageUrl: user.profile_image_url ?? undefined,
    }
    const response = NextResponse.redirect(redirectTarget)

    response.cookies.delete(KAKAO_OAUTH_STATE_COOKIE)
    response.cookies.delete(KAKAO_PENDING_SIGNUP_COOKIE)
    response.cookies.set(USER_SESSION_COOKIE, createSessionToken(session), {
      httpOnly: true,
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
      maxAge: getUserSessionMaxAgeSeconds(),
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Kakao login failed. / 카카오 로그인 실패.', error)
    redirectTarget.searchParams.set('auth', 'failed')

    return NextResponse.redirect(redirectTarget)
  }
}

async function requestKakaoAccessToken(code: string, redirectUri: string): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: getKakaoRestApiKey(),
    redirect_uri: redirectUri,
    code,
  })
  const clientSecret = getKakaoClientSecret()

  if (clientSecret) body.set('client_secret', clientSecret)

  const response = await fetch(KAKAO_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body,
  })
  const data = await response.json() as KakaoTokenResponse

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description ?? data.error ?? 'Failed to request Kakao access token')
  }

  return data.access_token
}

async function requestKakaoUser(accessToken: string): Promise<Required<Pick<KakaoUserResponse, 'id'>> & KakaoUserResponse> {
  const response = await fetch(KAKAO_USER_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await response.json() as KakaoUserResponse

  if (!response.ok || typeof data.id !== 'number') {
    throw new Error('Failed to request Kakao user profile')
  }

  return data as Required<Pick<KakaoUserResponse, 'id'>> & KakaoUserResponse
}

interface PendingSignupProfile {
  nickname: string
  animal: NicknameAnimal
}

function parsePendingSignupCookie(raw: string | undefined): PendingSignupProfile | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as { nickname?: unknown; animal?: unknown }
    if (typeof parsed.nickname === 'string' && typeof parsed.animal === 'string' && isNicknameAnimal(parsed.animal)) {
      return { nickname: parsed.nickname, animal: parsed.animal }
    }
  } catch {
    // ignore
  }
  return null
}

async function upsertKakaoUser(
  kakaoUser: Required<Pick<KakaoUserResponse, 'id'>> & KakaoUserResponse,
  pendingProfile: PendingSignupProfile | null,
): Promise<DatabaseUser> {
  const profile = kakaoUser.kakao_account?.profile
  const nickname = profile?.nickname?.trim() || `Kakao ${kakaoUser.id}`
  const kakaoId = String(kakaoUser.id)
  const databaseClient = createSupabaseAdminClient()
  const { data: existingUser, error: existingUserError } = await databaseClient
    .from('users')
    .select('id, kakao_id, nickname, profile_image_url, site_nickname, site_animal')
    .eq('kakao_id', kakaoId)
    .maybeSingle()

  if (existingUserError) throw existingUserError

  if (existingUser) {
    const { data, error } = await databaseClient
      .from('users')
      .update({
        nickname,
        profile_image_url: profile?.profile_image_url ?? null,
      })
      .eq('id', existingUser.id)
      .select('id, kakao_id, nickname, profile_image_url, site_nickname, site_animal')
      .single()

    if (error) throw error

    return data as DatabaseUser
  }

  const siteProfile = pendingProfile ?? generateNickname()
  const { data, error } = await databaseClient
    .from('users')
    .insert({
      kakao_id: kakaoId,
      nickname,
      profile_image_url: profile?.profile_image_url ?? null,
      site_nickname: siteProfile.nickname,
      site_animal: siteProfile.animal,
    })
    .select('id, kakao_id, nickname, profile_image_url, site_nickname, site_animal')
    .single()

  if (error) throw error

  return data as DatabaseUser
}

function getRedirectUri(request: NextRequest): string {
  return process.env.KAKAO_REDIRECT_URI ?? new URL('/api/auth/kakao/callback', request.nextUrl.origin).toString()
}
