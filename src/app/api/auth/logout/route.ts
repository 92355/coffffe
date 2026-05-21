import { NextResponse } from 'next/server'
import { USER_SESSION_COOKIE } from '@/lib/user-auth'

export function POST() {
  const response = NextResponse.json({ ok: true })

  response.cookies.delete(USER_SESSION_COOKIE)

  return response
}
