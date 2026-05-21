import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  KAKAO_OAUTH_STATE_COOKIE,
  USER_SESSION_COOKIE,
  createSessionToken,
  getKakaoClientSecret,
  getKakaoRestApiKey,
  getUserSessionMaxAgeSeconds,
  type UserSession,
} from '@/lib/user-auth'

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
    const user = await upsertKakaoUser(kakaoUser)
    const session: UserSession = {
      userId: user.id,
      kakaoId: user.kakao_id,
      nickname: user.nickname,
      profileImageUrl: user.profile_image_url ?? undefined,
    }
    const response = NextResponse.redirect(redirectTarget)

    response.cookies.delete(KAKAO_OAUTH_STATE_COOKIE)
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

async function upsertKakaoUser(kakaoUser: Required<Pick<KakaoUserResponse, 'id'>> & KakaoUserResponse): Promise<DatabaseUser> {
  const profile = kakaoUser.kakao_account?.profile
  const nickname = profile?.nickname?.trim() || `Kakao ${kakaoUser.id}`
  const kakaoId = String(kakaoUser.id)
  const { data, error } = await createSupabaseAdminClient()
    .from('users')
    .upsert({
      kakao_id: kakaoId,
      nickname,
      profile_image_url: profile?.profile_image_url ?? null,
    }, { onConflict: 'kakao_id' })
    .select('id, kakao_id, nickname, profile_image_url')
    .single()

  if (error) throw error

  return data as DatabaseUser
}

function getRedirectUri(request: NextRequest): string {
  return process.env.KAKAO_REDIRECT_URI ?? new URL('/api/auth/kakao/callback', request.nextUrl.origin).toString()
}
