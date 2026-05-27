import 'server-only'

import type { CafeReport, ReportStatus, ReportType } from '@/types/report'
import { createSupabaseAdminClient } from '../supabase'

// ── Members ────────────────────────────────────────────────────────────────

export interface MemberRow {
  id: string
  kakao_id: string
  site_nickname: string | null
  site_animal: string | null
  nickname: string
  profile_image_url: string | null
  created_at: string
  cbti_type: string | null
}

export async function listMembers(): Promise<MemberRow[]> {
  const { data, error } = await createSupabaseAdminClient()
    .from('users')
    .select('id, kakao_id, site_nickname, site_animal, nickname, profile_image_url, created_at, user_cbti_profiles(cbti_type)')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (
    (data as {
      id: string; kakao_id: string; site_nickname: string | null; site_animal: string | null
      nickname: string; profile_image_url: string | null; created_at: string
      user_cbti_profiles: { cbti_type: string }[]
    }[]) ?? []
  ).map((row) => ({
    id: row.id,
    kakao_id: row.kakao_id,
    site_nickname: row.site_nickname,
    site_animal: row.site_animal,
    nickname: row.nickname,
    profile_image_url: row.profile_image_url,
    created_at: row.created_at,
    cbti_type: row.user_cbti_profiles?.[0]?.cbti_type ?? null,
  }))
}

export interface MemberUpdate {
  id: string
  site_nickname?: string
  site_animal?: string
  profile_image_url?: string | null
  cbti_type?: string | null
}

export async function updateMember(update: MemberUpdate): Promise<void> {
  const supabase = createSupabaseAdminClient()

  const userUpdate: Record<string, unknown> = {}
  if (update.site_nickname !== undefined) userUpdate.site_nickname = update.site_nickname
  if (update.site_animal !== undefined) userUpdate.site_animal = update.site_animal
  if (update.profile_image_url !== undefined) userUpdate.profile_image_url = update.profile_image_url || null

  if (Object.keys(userUpdate).length > 0) {
    const { error } = await supabase.from('users').update(userUpdate).eq('id', update.id)
    if (error) throw error
  }

  if (update.cbti_type !== undefined) {
    if (update.cbti_type) {
      const { error } = await supabase
        .from('user_cbti_profiles')
        .upsert({ user_id: update.id, cbti_type: update.cbti_type }, { onConflict: 'user_id' })
      if (error) throw error
    } else {
      const { error } = await supabase.from('user_cbti_profiles').delete().eq('user_id', update.id)
      if (error) throw error
    }
  }
}

export async function deleteMember(id: string): Promise<void> {
  const { error } = await createSupabaseAdminClient().from('users').delete().eq('id', id)
  if (error) throw error
}

// ── Reports ────────────────────────────────────────────────────────────────

interface DatabaseReport {
  id: string
  type: ReportType
  cafe_id: string | null
  kakao_place_id: string | null
  name: string | null
  address: string | null
  lat: number | null
  lng: number | null
  image_url: string | null
  correction_types: string[] | null
  memo: string | null
  anonymous_id: string
  nickname: string
  status: ReportStatus
  created_at: string
}

export function toReport(row: DatabaseReport): CafeReport {
  return {
    id: row.id,
    type: row.type,
    cafeId: row.cafe_id ?? undefined,
    kakaoPlaceId: row.kakao_place_id ?? undefined,
    name: row.name ?? undefined,
    address: row.address ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    imageUrl: row.image_url ?? undefined,
    correctionTypes: row.correction_types ?? [],
    memo: row.memo ?? undefined,
    anonymousId: row.anonymous_id,
    nickname: row.nickname,
    status: row.status,
    createdAt: row.created_at,
  }
}

export async function listReports(): Promise<CafeReport[]> {
  const { data, error } = await createSupabaseAdminClient()
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as DatabaseReport[]).map(toReport)
}

export async function updateReportStatus(id: string, status: ReportStatus): Promise<CafeReport> {
  const { data, error } = await createSupabaseAdminClient()
    .from('reports')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return toReport(data as DatabaseReport)
}

export async function deleteReport(id: string): Promise<void> {
  const { error } = await createSupabaseAdminClient().from('reports').delete().eq('id', id)
  if (error) throw error
}

// ── Beans ──────────────────────────────────────────────────────────────────

export interface BeanRow {
  id: string
  name: string
  name_en: string
  origin: string
  region: string
  variety: string
  process: string
  roast: string
  notes: string[]
  body: string
  acidity: string
  description: string
  flag: string
  special: string | null
}

export async function insertBean(row: BeanRow): Promise<void> {
  const { error } = await createSupabaseAdminClient().from('beans').insert(row)
  if (error) throw error
}

export async function updateBean(id: string, row: Omit<BeanRow, 'id'>): Promise<void> {
  const { error } = await createSupabaseAdminClient().from('beans').update(row).eq('id', id)
  if (error) throw error
}

export async function deleteBean(id: string): Promise<void> {
  const { error } = await createSupabaseAdminClient().from('beans').delete().eq('id', id)
  if (error) throw error
}

// ── Storage ────────────────────────────────────────────────────────────────

export async function uploadCafeImage(path: string, file: File): Promise<string> {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.storage
    .from('cafe-images')
    .upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('cafe-images').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadAvatar(path: string, file: File, userId: string): Promise<string> {
  const supabase = createSupabaseAdminClient()
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  const { error: updateError } = await supabase
    .from('users')
    .update({ profile_image_url: data.publicUrl })
    .eq('id', userId)
  if (updateError) throw updateError
  return data.publicUrl
}

// ── Reports (user-facing insert) ───────────────────────────────────────────

export interface DatabaseReportPayload {
  type: ReportType
  cafe_id: string | null
  kakao_place_id: string | null
  name: string | null
  address: string | null
  lat: number | null
  lng: number | null
  correction_types: string[]
  memo: string | null
  anonymous_id: string
  nickname: string
}

export async function insertReport(payload: DatabaseReportPayload): Promise<{ id: string }> {
  const { data, error } = await createSupabaseAdminClient()
    .from('reports')
    .insert(payload)
    .select('id')
    .single()
  if (error) throw error
  return data as { id: string }
}
