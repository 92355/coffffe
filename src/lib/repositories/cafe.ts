import 'server-only'

import type { BeanOrigin, BrewMethod, Cafe, RoastLevel } from '@/types/cafe'
import { createSupabaseAdminClient } from '../supabase'

interface DatabaseCafe {
  id: string
  name: string
  short_description: string
  full_description: string
  address: string
  lat: number
  lng: number
  roast_levels: RoastLevel[]
  bean_origins: BeanOrigin[]
  brew_methods: BrewMethod[]
  quality_score: number
  tags: string[]
  open_hours: string
  closed_days: string[]
  images: string[]
  phone: string | null
  instagram_handle: string | null
  kakao_place_id: string | null
  show_aroma?: boolean | null
  updated_at?: string
}

export interface DatabaseCafeWrite {
  id: string
  name: string
  short_description: string
  full_description: string
  address: string
  lat: number
  lng: number
  roast_levels: RoastLevel[]
  bean_origins: BeanOrigin[]
  brew_methods: BrewMethod[]
  quality_score: number
  tags: string[]
  open_hours: string
  closed_days: string[]
  images: string[]
  phone: string | null
  instagram_handle: string | null
  kakao_place_id: string | null
  show_aroma: boolean
}

export function toCafe(row: DatabaseCafe): Cafe {
  return {
    id: row.id,
    name: row.name,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    roastLevels: row.roast_levels,
    beanOrigins: row.bean_origins,
    brewMethods: row.brew_methods,
    qualityScore: row.quality_score,
    tags: row.tags,
    openHours: row.open_hours,
    closedDays: row.closed_days,
    images: row.images,
    phone: row.phone ?? undefined,
    instagramHandle: row.instagram_handle ?? undefined,
    kakaoPlaceId: row.kakao_place_id ?? undefined,
    showAroma: row.show_aroma ?? true,
    updatedAt: row.updated_at,
  }
}

export function cafeToDbWrite(cafe: {
  id: string; name: string; shortDescription: string; fullDescription: string
  address: string; lat: number; lng: number; roastLevels: RoastLevel[]
  beanOrigins: BeanOrigin[]; brewMethods: BrewMethod[]; qualityScore: number
  tags: string[]; openHours: string; closedDays: string[]; images: string[]
  phone?: string; instagramHandle?: string; kakaoPlaceId?: string; showAroma: boolean
}): DatabaseCafeWrite {
  return {
    id: cafe.id,
    name: cafe.name,
    short_description: cafe.shortDescription,
    full_description: cafe.fullDescription,
    address: cafe.address,
    lat: cafe.lat,
    lng: cafe.lng,
    roast_levels: cafe.roastLevels,
    bean_origins: cafe.beanOrigins,
    brew_methods: cafe.brewMethods,
    quality_score: cafe.qualityScore,
    tags: cafe.tags,
    open_hours: cafe.openHours,
    closed_days: cafe.closedDays,
    images: cafe.images,
    phone: cafe.phone ?? null,
    instagram_handle: cafe.instagramHandle ?? null,
    kakao_place_id: cafe.kakaoPlaceId ?? null,
    show_aroma: cafe.showAroma,
  }
}

export async function listCafes(): Promise<Cafe[]> {
  const { data, error } = await createSupabaseAdminClient()
    .from('cafes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as DatabaseCafe[]).map(toCafe)
}

export async function upsertCafe(payload: DatabaseCafeWrite): Promise<Cafe> {
  const supabase = createSupabaseAdminClient()

  if (payload.kakao_place_id) {
    const { data: existing, error: findError } = await supabase
      .from('cafes')
      .select('id')
      .eq('kakao_place_id', payload.kakao_place_id)
      .maybeSingle<{ id: string }>()

    if (findError) throw findError

    if (existing) {
      const { data, error } = await supabase
        .from('cafes')
        .update({ ...payload, id: existing.id })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      return toCafe(data as DatabaseCafe)
    }
  }

  const { data, error } = await supabase
    .from('cafes')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw error
  return toCafe(data as DatabaseCafe)
}

export async function updateCafe(payload: DatabaseCafeWrite): Promise<Cafe> {
  const { data, error } = await createSupabaseAdminClient()
    .from('cafes')
    .update(payload)
    .eq('id', payload.id)
    .select()
    .single()

  if (error) throw error
  return toCafe(data as DatabaseCafe)
}

export async function deleteCafe(id: string): Promise<void> {
  const { error } = await createSupabaseAdminClient()
    .from('cafes')
    .delete()
    .eq('id', id)

  if (error) throw error
}
