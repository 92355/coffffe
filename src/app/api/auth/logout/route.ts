import { NextRequest, NextResponse } from 'next/server'
import { USER_SESSION_COOKIE } from '@/lib/user-auth'

export function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true })

  response.cookies.set(USER_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
    maxAge: 0,
    path: '/',
  })

  return response
}
