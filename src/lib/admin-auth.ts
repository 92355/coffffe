import 'server-only'

import { createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

export const ADMIN_SESSION_COOKIE = 'admin_session'

const ADMIN_SECRET_KEY = 'ADMIN_SECRET'
const BEARER_PREFIX = 'Bearer '
const SIGNATURE_ALGORITHM = 'sha256'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8

interface AdminSessionPayload {
  purpose: 'admin'
  expiresAt: number
}

export function getAdminSecret(): string {
  const secret = process.env[ADMIN_SECRET_KEY]

  if (!secret) {
    throw new Error(`Missing required environment variable: ${ADMIN_SECRET_KEY}`)
  }

  return secret
}

export function isAdminSessionValue(value: string | undefined): boolean {
  if (!value) return false

  const secret = process.env[ADMIN_SECRET_KEY]
  if (!secret) return false

  const [encodedPayload, signature] = value.split('.')
  if (!encodedPayload || !signature) return false

  const expectedSignature = signAdminPayload(encodedPayload, secret)
  if (!isEqualSignature(signature, expectedSignature)) return false

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as Partial<AdminSessionPayload>

    return payload.purpose === 'admin' &&
      typeof payload.expiresAt === 'number' &&
      payload.expiresAt > Date.now()
  } catch {
    return false
  }
}

export function isAuthorizedAdminRequest(request: NextRequest): boolean {
  const authorization = request.headers.get('authorization')
  const bearerToken = authorization?.startsWith(BEARER_PREFIX)
    ? authorization.slice(BEARER_PREFIX.length)
    : undefined
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value

  return isAdminSessionValue(bearerToken) || isAdminSessionValue(sessionCookie)
}

export function createAdminSessionToken(): string {
  const payload: AdminSessionPayload = {
    purpose: 'admin',
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  }
  const encodedPayload = encodeBase64Url(JSON.stringify(payload))
  const signature = signAdminPayload(encodedPayload, getAdminSecret())

  return `${encodedPayload}.${signature}`
}

export function getAdminSessionMaxAgeSeconds(): number {
  return SESSION_MAX_AGE_SECONDS
}

function signAdminPayload(encodedPayload: string, secret: string): string {
  return createHmac(SIGNATURE_ALGORITHM, secret)
    .update(encodedPayload)
    .digest('base64url')
}

function isEqualSignature(received: string, expected: string): boolean {
  const receivedBuffer = Buffer.from(received)
  const expectedBuffer = Buffer.from(expected)

  if (receivedBuffer.length !== expectedBuffer.length) return false

  return timingSafeEqual(receivedBuffer, expectedBuffer)
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8')
}
