import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { KAKAO_OAUTH_STATE_COOKIE, getKakaoRestApiKey } from '@/lib/user-auth'

const KAKAO_AUTHORIZE_URL = 'https://kauth.kakao.com/oauth/authorize'
const OAUTH_STATE_MAX_AGE_SECONDS = 60 * 10

export function GET(request: NextRequest) {
  const state = randomBytes(24).toString('base64url')
  const redirectUri = getRedirectUri(request)
  const authorizeUrl = new URL(KAKAO_AUTHORIZE_URL)

  authorizeUrl.searchParams.set('client_id', getKakaoRestApiKey())
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('state', state)

  const response = NextResponse.redirect(authorizeUrl)
  response.cookies.set(KAKAO_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
    path: '/',
  })

  return response
}

function getRedirectUri(request: NextRequest): string {
  return process.env.KAKAO_REDIRECT_URI ?? new URL('/api/auth/kakao/callback', request.nextUrl.origin).toString()
}
