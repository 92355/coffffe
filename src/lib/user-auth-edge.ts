import 'server-only'

import { getRequiredEnv } from './env'

export const USER_SESSION_COOKIE = 'wonduro_session'
export const KAKAO_OAUTH_STATE_COOKIE = 'wonduro_kakao_oauth_state'
export const KAKAO_PENDING_SIGNUP_COOKIE = 'wonduro_pending_signup'
export const KAKAO_RETURN_TO_COOKIE = 'wonduro_kakao_return_to'

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const KAKAO_REST_API_KEY = 'KAKAO_REST_API_KEY'
const KAKAO_CLIENT_SECRET = 'KAKAO_CLIENT_SECRET'

export function getKakaoRestApiKey(): string {
  return getRequiredEnv(KAKAO_REST_API_KEY)
}

export function getKakaoClientSecret(): string | undefined {
  return process.env[KAKAO_CLIENT_SECRET]
}

export function getUserSessionMaxAgeSeconds(): number {
  return SESSION_MAX_AGE_SECONDS
}
