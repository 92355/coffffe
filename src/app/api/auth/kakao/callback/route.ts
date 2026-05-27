import { NextRequest, NextResponse } from 'next/server'
import {
  KAKAO_OAUTH_STATE_COOKIE,
  KAKAO_PENDING_SIGNUP_COOKIE,
  KAKAO_RETURN_TO_COOKIE,
  USER_SESSION_COOKIE,
  createSessionToken,
  getUserSessionMaxAgeSeconds,
} from '@/lib/user-auth'
import { getOptionalEnv } from '@/lib/env'
import { handleKakaoOAuthCallback } from '@/lib/services/auth'

const FALLBACK_REDIRECT_PATH = '/'

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get('state')
  const code = request.nextUrl.searchParams.get('code')
  const storedState = request.cookies.get(KAKAO_OAUTH_STATE_COOKIE)?.value
  const redirectTarget = getRedirectTarget(request)

  if (!code || !state || !storedState || state !== storedState) {
    redirectTarget.searchParams.set('auth', 'failed')
    return NextResponse.redirect(redirectTarget)
  }

  try {
    const redirectUri = getRedirectUri(request)
    const pendingProfileRaw = request.cookies.get(KAKAO_PENDING_SIGNUP_COOKIE)?.value
    const session = await handleKakaoOAuthCallback(code, redirectUri, pendingProfileRaw)

    const response = NextResponse.redirect(redirectTarget)
    response.cookies.delete(KAKAO_OAUTH_STATE_COOKIE)
    response.cookies.delete(KAKAO_PENDING_SIGNUP_COOKIE)
    response.cookies.delete(KAKAO_RETURN_TO_COOKIE)
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

function getRedirectTarget(request: NextRequest): URL {
  const returnTo = sanitizeReturnTo(request.cookies.get(KAKAO_RETURN_TO_COOKIE)?.value)
  return new URL(returnTo ?? FALLBACK_REDIRECT_PATH, request.nextUrl.origin)
}

function sanitizeReturnTo(value: string | undefined): string | null {
  if (!value?.startsWith('/')) return null
  if (value.startsWith('//')) return null
  return value
}

function getRedirectUri(request: NextRequest): string {
  return getOptionalEnv('KAKAO_REDIRECT_URI') ?? new URL('/api/auth/kakao/callback', request.nextUrl.origin).toString()
}
