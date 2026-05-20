import { NextRequest, NextResponse } from 'next/server'
import cafes from '@/data/cafes.json'
import type { Cafe, RoastLevel, BeanOrigin, BrewMethod } from '@/types/cafe'
import { createSupabaseAdminClient, createSupabaseClient } from '@/lib/supabase'

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
}

const fallbackCafes = cafes as Cafe[]

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
  }
}

function applyFilters(
  cafesToFilter: Cafe[],
  roast: RoastLevel | null,
  origin: BeanOrigin | null,
  method: BrewMethod | null,
): Cafe[] {
  return cafesToFilter.filter((cafe) => {
    if (roast && !cafe.roastLevels.includes(roast)) return false
    if (origin && !cafe.beanOrigins.includes(origin)) return false
    if (method && !cafe.brewMethods.includes(method)) return false

    return true
  })
}

async function getCafes(): Promise<Cafe[]> {
  try {
    return await getAdminCafes()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Supabase admin error'
    console.error('Failed to fetch cafes with admin client:', message)
  }

  try {
    const { data, error } = await createSupabaseClient()
      .from('cafes')
      .select('*')
      .order('quality_score', { ascending: false })

    if (error) {
      console.error('Failed to fetch cafes from Supabase:', error.message)
      return fallbackCafes
    }

    return (data as DatabaseCafe[]).map(toCafe)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Supabase error'
    console.error('Using local cafe fallback:', message)
    return fallbackCafes
  }
}

async function getAdminCafes(): Promise<Cafe[]> {
  const { data, error } = await createSupabaseAdminClient()
    .from('cafes')
    .select('*')
    .order('quality_score', { ascending: false })

  if (error) {
    throw error
  }

  return (data as DatabaseCafe[]).map(toCafe)
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const roast = searchParams.get('roast') as RoastLevel | null
  const origin = searchParams.get('origin') as BeanOrigin | null
  const method = searchParams.get('method') as BrewMethod | null

  const result = applyFilters(await getCafes(), roast, origin, method)

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
