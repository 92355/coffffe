import 'server-only'

import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

export const USER_SESSION_COOKIE = 'coffffe_session'
export const KAKAO_OAUTH_STATE_COOKIE = 'coffffe_kakao_oauth_state'
export const KAKAO_PENDING_SIGNUP_COOKIE = 'coffffe_pending_signup'
export const KAKAO_RETURN_TO_COOKIE = 'coffffe_kakao_return_to'

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const KAKAO_REST_API_KEY = 'KAKAO_REST_API_KEY'
const KAKAO_CLIENT_SECRET = 'KAKAO_CLIENT_SECRET'
const KAKAO_SESSION_SECRET = 'KAKAO_SESSION_SECRET'
const ADMIN_SECRET = 'ADMIN_SECRET'
const SIGNATURE_ALGORITHM = 'sha256'

export interface UserSession {
  userId: string
  kakaoId: string
  nickname: string
  profileImageUrl?: string
}

interface SessionPayload extends UserSession {
  expiresAt: number
}

export function getKakaoRestApiKey(): string {
  return getRequiredEnv(KAKAO_REST_API_KEY)
}

export function getKakaoClientSecret(): string | undefined {
  return process.env[KAKAO_CLIENT_SECRET]
}

export function getUserSessionMaxAgeSeconds(): number {
  return SESSION_MAX_AGE_SECONDS
}

export async function getUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const rawSession = cookieStore.get(USER_SESSION_COOKIE)?.value

  if (!rawSession) return null

  return verifySession(rawSession)
}

export function createSessionToken(session: UserSession): string {
  const payload: SessionPayload = {
    ...session,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  }
  const encodedPayload = encodeBase64Url(JSON.stringify(payload))
  const signature = signSessionPayload(encodedPayload)

  return `${encodedPayload}.${signature}`
}

function verifySession(token: string): UserSession | null {
  const [encodedPayload, signature] = token.split('.')

  if (!encodedPayload || !signature) return null

  const expectedSignature = signSessionPayload(encodedPayload)
  if (!isEqualSignature(signature, expectedSignature)) return null

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as Partial<SessionPayload>

    if (
      typeof payload.userId !== 'string' ||
      typeof payload.kakaoId !== 'string' ||
      typeof payload.nickname !== 'string' ||
      typeof payload.expiresAt !== 'number' ||
      payload.expiresAt < Date.now()
    ) {
      return null
    }

    return {
      userId: payload.userId,
      kakaoId: payload.kakaoId,
      nickname: payload.nickname,
      profileImageUrl: typeof payload.profileImageUrl === 'string' ? payload.profileImageUrl : undefined,
    }
  } catch (error) {
    console.error('Failed to verify user session. / 사용자 세션 검증에 실패했습니다.', error)
    return null
  }
}

function signSessionPayload(encodedPayload: string): string {
  return createHmac(SIGNATURE_ALGORITHM, getSessionSecret())
    .update(encodedPayload)
    .digest('base64url')
}

function isEqualSignature(received: string, expected: string): boolean {
  const receivedBuffer = Buffer.from(received)
  const expectedBuffer = Buffer.from(expected)

  if (receivedBuffer.length !== expectedBuffer.length) return false

  return timingSafeEqual(receivedBuffer, expectedBuffer)
}

function getSessionSecret(): string {
  return process.env[KAKAO_SESSION_SECRET] ?? getRequiredEnv(ADMIN_SECRET)
}

function getRequiredEnv(key: string): string {
  const value = process.env[key]

  if (!value) throw new Error(`Missing required environment variable: ${key}`)

  return value
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8')
}
