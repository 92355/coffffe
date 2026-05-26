import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import type { Cafe, RoastLevel, BeanOrigin, BrewMethod } from '@/types/cafe'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { matchesFilters } from '@/lib/cafeFilters'

export const CAFES_CACHE_TAG = 'cafes'
const CAFES_CACHE_TTL_SECONDS = 300

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
  updated_at: string
}

function toCafe(databaseCafe: DatabaseCafe): Cafe {
  return {
    id: databaseCafe.id,
    name: databaseCafe.name,
    shortDescription: databaseCafe.short_description,
    fullDescription: databaseCafe.full_description,
    address: databaseCafe.address,
    lat: databaseCafe.lat,
    lng: databaseCafe.lng,
    roastLevels: databaseCafe.roast_levels,
    beanOrigins: databaseCafe.bean_origins,
    brewMethods: databaseCafe.brew_methods,
    qualityScore: databaseCafe.quality_score,
    tags: databaseCafe.tags,
    openHours: databaseCafe.open_hours,
    closedDays: databaseCafe.closed_days,
    images: databaseCafe.images,
    phone: databaseCafe.phone ?? undefined,
    instagramHandle: databaseCafe.instagram_handle ?? undefined,
    kakaoPlaceId: databaseCafe.kakao_place_id ?? undefined,
    showAroma: databaseCafe.show_aroma ?? true,
    updatedAt: databaseCafe.updated_at,
  }
}


async function fetchCafes(): Promise<Cafe[]> {
  const { data, error } = await createSupabaseAdminClient()
    .from('cafes')
    .select('*')
    .order('quality_score', { ascending: false })

  if (error) throw error

  return (data as DatabaseCafe[]).map(toCafe)
}

const getCafes = unstable_cache(fetchCafes, [CAFES_CACHE_TAG], {
  tags: [CAFES_CACHE_TAG],
  revalidate: CAFES_CACHE_TTL_SECONDS,
})

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const roast = searchParams.get('roast') as RoastLevel | null
  const origin = searchParams.get('origin') as BeanOrigin | null
  const method = searchParams.get('method') as BrewMethod | null

  const filters = { roastLevel: roast, beanOrigin: origin, brewMethod: method }
  const result = (await getCafes()).filter(cafe => matchesFilters(cafe, filters))

  return NextResponse.json(result)
}
