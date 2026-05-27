import 'server-only'

import { generateNickname, isNicknameAnimal, type NicknameAnimal } from '@/lib/nickname'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { isAdminKakaoId } from '@/lib/identity'
import { exchangeKakaoToken, fetchKakaoUserProfile, type KakaoUserProfile } from '@/lib/kakao/oauth'
import type { UserSession } from '@/lib/user-auth'

export type { UserSession }

interface PendingSignupProfile {
  nickname: string
  animal: NicknameAnimal
}

export function parsePendingSignupCookie(raw: string | undefined): PendingSignupProfile | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as { nickname?: unknown; animal?: unknown }
    if (typeof parsed.nickname === 'string' && typeof parsed.animal === 'string' && isNicknameAnimal(parsed.animal)) {
      return { nickname: parsed.nickname, animal: parsed.animal }
    }
  } catch {
    // ignore
  }
  return null
}

interface DatabaseUser {
  id: string
  kakao_id: string
  nickname: string
  profile_image_url: string | null
  site_nickname: string
  site_animal: NicknameAnimal
}

async function upsertKakaoUser(
  kakaoUser: KakaoUserProfile,
  pendingProfile: PendingSignupProfile | null,
): Promise<DatabaseUser> {
  const siteProfile = pendingProfile ?? generateNickname()
  const { data, error } = await createSupabaseAdminClient()
    .rpc('upsert_kakao_user', {
      p_kakao_id: String(kakaoUser.id),
      p_nickname: kakaoUser.nickname?.trim() || `Kakao ${kakaoUser.id}`,
      p_profile_image_url: kakaoUser.profileImageUrl ?? null,
      p_site_nickname: siteProfile.nickname,
      p_site_animal: siteProfile.animal,
    })
    .single()

  if (error) throw error
  return data as DatabaseUser
}

export async function handleKakaoOAuthCallback(
  code: string,
  redirectUri: string,
  pendingProfileRaw: string | undefined,
): Promise<UserSession> {
  const accessToken = await exchangeKakaoToken(code, redirectUri)
  const kakaoUser = await fetchKakaoUserProfile(accessToken)
  const pendingProfile = parsePendingSignupCookie(pendingProfileRaw)
  const user = await upsertKakaoUser(kakaoUser, pendingProfile)

  return {
    userId: user.id,
    kakaoId: user.kakao_id,
    nickname: user.nickname,
    profileImageUrl: user.profile_image_url ?? undefined,
    siteNickname: user.site_nickname,
    siteAnimal: user.site_animal,
    isAdmin: isAdminKakaoId(user.kakao_id),
  }
}
