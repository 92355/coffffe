import 'server-only'

import type { NextRequest } from 'next/server'

export const ADMIN_SESSION_COOKIE = 'admin_session'

const ADMIN_SECRET_KEY = 'ADMIN_SECRET'
const BEARER_PREFIX = 'Bearer '

export function getAdminSecret(): string {
  const secret = process.env[ADMIN_SECRET_KEY]

  if (!secret) {
    throw new Error(`Missing required environment variable: ${ADMIN_SECRET_KEY}`)
  }

  return secret
}

export function isAdminSessionValue(value: string | undefined): boolean {
  const secret = process.env[ADMIN_SECRET_KEY]

  return Boolean(secret && value === secret)
}

export function isAuthorizedAdminRequest(request: NextRequest): boolean {
  const authorization = request.headers.get('authorization')
  const bearerToken = authorization?.startsWith(BEARER_PREFIX)
    ? authorization.slice(BEARER_PREFIX.length)
    : undefined
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value

  return isAdminSessionValue(bearerToken) || isAdminSessionValue(sessionCookie)
}
