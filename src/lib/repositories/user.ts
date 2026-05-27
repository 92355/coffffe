import 'server-only'

import { createSupabaseAdminClient } from '../supabase'

export async function getFavorites(userId: string): Promise<string[]> {
  const { data, error } = await createSupabaseAdminClient()
    .from('favorite_cafes')
    .select('cafe_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as { cafe_id: string }[]).map((row) => row.cafe_id)
}

export async function addFavorite(userId: string, cafeId: string): Promise<void> {
  const { error } = await createSupabaseAdminClient()
    .from('favorite_cafes')
    .upsert({ user_id: userId, cafe_id: cafeId }, { onConflict: 'user_id,cafe_id' })

  if (error) throw error
}

export async function removeFavorite(userId: string, cafeId: string): Promise<void> {
  const { error } = await createSupabaseAdminClient()
    .from('favorite_cafes')
    .delete()
    .eq('user_id', userId)
    .eq('cafe_id', cafeId)

  if (error) throw error
}

export async function deleteFavoritesByUser(userId: string): Promise<void> {
  const { error } = await createSupabaseAdminClient()
    .from('favorite_cafes')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
}

export interface CbtiProfile {
  cbtiType: string | null
  updatedAt: string | null
}

export async function getCbtiProfile(userId: string): Promise<CbtiProfile> {
  const { data, error } = await createSupabaseAdminClient()
    .from('user_cbti_profiles')
    .select('cbti_type, updated_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return { cbtiType: data?.cbti_type ?? null, updatedAt: data?.updated_at ?? null }
}

export async function upsertCbtiProfile(userId: string, cbtiType: string): Promise<CbtiProfile> {
  const { data, error } = await createSupabaseAdminClient()
    .from('user_cbti_profiles')
    .upsert({ user_id: userId, cbti_type: cbtiType }, { onConflict: 'user_id' })
    .select('cbti_type, updated_at')
    .single()

  if (error) throw error
  return { cbtiType: data.cbti_type, updatedAt: data.updated_at }
}

export async function deleteCbtiProfileByUser(userId: string): Promise<void> {
  const { error } = await createSupabaseAdminClient()
    .from('user_cbti_profiles')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
}

export interface UserProfileRecord {
  id: string
  kakaoId: string
  nickname: string
  profileImageUrl: string | null
  siteNickname: string
  siteAnimal: string
}

export async function getUserProfile(userId: string): Promise<UserProfileRecord | null> {
  const { data, error } = await createSupabaseAdminClient()
    .from('users')
    .select('id, kakao_id, nickname, profile_image_url, site_nickname, site_animal')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Failed to read user profile. / 사용자 프로필 조회 실패.', error)
    return null
  }
  if (!data) return null

  const row = data as {
    id: string; kakao_id: string; nickname: string
    profile_image_url: string | null; site_nickname: string; site_animal: string
  }

  return {
    id: row.id,
    kakaoId: row.kakao_id,
    nickname: row.nickname,
    profileImageUrl: row.profile_image_url,
    siteNickname: row.site_nickname,
    siteAnimal: row.site_animal,
  }
}

export async function updateUserSiteProfile(
  userId: string,
  siteNickname: string,
  siteAnimal: string,
): Promise<{ siteNickname: string; siteAnimal: string } | null> {
  const { data, error } = await createSupabaseAdminClient()
    .from('users')
    .update({ site_nickname: siteNickname, site_animal: siteAnimal })
    .eq('id', userId)
    .select('site_nickname, site_animal')
    .single()

  if (error) {
    console.error('Failed to update site profile. / 사이트 프로필 갱신 실패.', error)
    return null
  }

  return { siteNickname: data.site_nickname, siteAnimal: data.site_animal }
}

export async function deleteUserProfile(userId: string): Promise<void> {
  const { error } = await createSupabaseAdminClient()
    .from('users')
    .delete()
    .eq('id', userId)

  if (error) throw error
}
