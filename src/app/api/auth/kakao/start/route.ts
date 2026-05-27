import { NextRequest, NextResponse } from 'next/server'
import {
  KAKAO_OAUTH_STATE_COOKIE,
  KAKAO_PENDING_SIGNUP_COOKIE,
  KAKAO_RETURN_TO_COOKIE,
  getKakaoRestApiKey,
  getKakaoRedirectUri,
} from '@/lib/user-auth-edge'
import { isNicknameAnimal } from '@/lib/nickname'

export const runtime = 'edge'

const KAKAO_AUTHORIZE_URL = 'https://kauth.kakao.com/oauth/authorize'
const OAUTH_STATE_MAX_AGE_SECONDS = 60 * 10

export function GET(request: NextRequest) {
  const state = generateState()
  const redirectUri = getRedirectUri(request)
  const authorizeUrl = new URL(KAKAO_AUTHORIZE_URL)

  authorizeUrl.searchParams.set('client_id', getKakaoRestApiKey())
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('state', state)

  const response = NextResponse.redirect(authorizeUrl)
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: request.nextUrl.protocol === 'https:',
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
    path: '/',
  }

  response.cookies.set(KAKAO_OAUTH_STATE_COOKIE, state, cookieOptions)

  const pendingNickname = request.nextUrl.searchParams.get('nickname')
  const pendingAnimal = request.nextUrl.searchParams.get('animal')
  if (pendingNickname && pendingAnimal && isNicknameAnimal(pendingAnimal)) {
    response.cookies.set(
      KAKAO_PENDING_SIGNUP_COOKIE,
      JSON.stringify({ nickname: pendingNickname, animal: pendingAnimal }),
      cookieOptions,
    )
  }

  const returnTo = sanitizeReturnTo(request.nextUrl.searchParams.get('returnTo'))
  if (returnTo) {
    response.cookies.set(KAKAO_RETURN_TO_COOKIE, returnTo, cookieOptions)
  }

  return response
}

function generateState(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)

  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function getRedirectUri(request: NextRequest): string {
  return getKakaoRedirectUri() ?? new URL('/api/auth/kakao/callback', request.nextUrl.origin).toString()
}

function sanitizeReturnTo(value: string | null): string | null {
  if (!value?.startsWith('/')) return null
  if (value.startsWith('//')) return null

  return value
}
