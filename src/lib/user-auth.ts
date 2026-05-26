import 'server-only'

import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

import { getRequiredEnv } from './env'
import {
  USER_SESSION_COOKIE,
  getUserSessionMaxAgeSeconds,
} from './user-auth-edge'

export {
  USER_SESSION_COOKIE,
  KAKAO_OAUTH_STATE_COOKIE,
  KAKAO_PENDING_SIGNUP_COOKIE,
  KAKAO_RETURN_TO_COOKIE,
  getKakaoRestApiKey,
  getKakaoClientSecret,
  getUserSessionMaxAgeSeconds,
} from './user-auth-edge'

const KAKAO_SESSION_SECRET = 'KAKAO_SESSION_SECRET'
const SIGNATURE_ALGORITHM = 'sha256'

export interface UserSession {
  userId: string
  kakaoId: string
  nickname: string
  profileImageUrl?: string
  siteNickname?: string
  siteAnimal?: string
  isAdmin?: boolean
}

interface SessionPayload extends UserSession {
  expiresAt: number
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
    expiresAt: Date.now() + getUserSessionMaxAgeSeconds() * 1000,
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
      siteNickname: typeof payload.siteNickname === 'string' ? payload.siteNickname : undefined,
      siteAnimal: typeof payload.siteAnimal === 'string' ? payload.siteAnimal : undefined,
      isAdmin: payload.isAdmin === true,
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
  return getRequiredEnv(KAKAO_SESSION_SECRET)
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8')
}
