import 'server-only'

import { getRequiredEnv, getOptionalEnv } from '../env'

const KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token'
const KAKAO_USER_URL = 'https://kapi.kakao.com/v2/user/me'

interface KakaoTokenResponse {
  access_token?: string
  error?: string
  error_description?: string
}

export interface KakaoUserProfile {
  id: number
  nickname?: string
  profileImageUrl?: string
}

export async function exchangeKakaoToken(code: string, redirectUri: string): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: getRequiredEnv('KAKAO_REST_API_KEY'),
    redirect_uri: redirectUri,
    code,
  })
  const clientSecret = getOptionalEnv('KAKAO_CLIENT_SECRET')
  if (clientSecret) body.set('client_secret', clientSecret)

  const response = await fetch(KAKAO_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body,
  })
  const data = await response.json() as KakaoTokenResponse

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description ?? data.error ?? 'Failed to request Kakao access token')
  }

  return data.access_token
}

export async function fetchKakaoUserProfile(accessToken: string): Promise<KakaoUserProfile> {
  const response = await fetch(KAKAO_USER_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await response.json() as {
    id?: number
    kakao_account?: { profile?: { nickname?: string; profile_image_url?: string } }
  }

  if (!response.ok || typeof data.id !== 'number') {
    throw new Error('Failed to request Kakao user profile')
  }

  return {
    id: data.id,
    nickname: data.kakao_account?.profile?.nickname,
    profileImageUrl: data.kakao_account?.profile?.profile_image_url,
  }
}
