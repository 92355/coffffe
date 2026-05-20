import { NextRequest, NextResponse } from 'next/server'
import type { BeanOrigin, BrewMethod, Cafe, RoastLevel } from '@/types/cafe'
import { isAuthorizedAdminRequest } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'

interface CafePayload extends Cafe {
  phone?: string
  instagramHandle?: string
  kakaoPlaceId?: string
}

interface DatabaseCafePayload {
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
  phone: string | null
  instagram_handle: string | null
  kakao_place_id: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key]

  if (typeof value !== 'string') {
    throw new Error(`"${key}" must be a string`)
  }

  return value
}

function readNonEmptyString(record: Record<string, unknown>, key: string): string {
  const value = readString(record, key).trim()

  if (value.length === 0) {
    throw new Error(`"${key}" must be a non-empty string`)
  }

  return value
}

function readOptionalString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key]

  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') throw new Error(`"${key}" must be a string`)

  return value
}

function readNumber(record: Record<string, unknown>, key: string): number {
  const value = record[key]

  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`"${key}" must be a number`)
  }

  return value
}

function readStringArray(record: Record<string, unknown>, key: string): string[] {
  const value = record[key]

  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`"${key}" must be a string array`)
  }

  return value
}

function readCafePayload(value: unknown): CafePayload {
  if (!isRecord(value)) {
    throw new Error('Request body must be an object')
  }

  return {
    id: readNonEmptyString(value, 'id'),
    name: readString(value, 'name'),
    shortDescription: readString(value, 'shortDescription'),
    fullDescription: readString(value, 'fullDescription'),
    address: readString(value, 'address'),
    lat: readNumber(value, 'lat'),
    lng: readNumber(value, 'lng'),
    roastLevels: readStringArray(value, 'roastLevels') as RoastLevel[],
    beanOrigins: readStringArray(value, 'beanOrigins') as BeanOrigin[],
    brewMethods: readStringArray(value, 'brewMethods') as BrewMethod[],
    qualityScore: readNumber(value, 'qualityScore'),
    tags: readStringArray(value, 'tags'),
    openHours: readString(value, 'openHours'),
    closedDays: readStringArray(value, 'closedDays'),
    phone: readOptionalString(value, 'phone'),
    instagramHandle: readOptionalString(value, 'instagramHandle'),
    kakaoPlaceId: readOptionalString(value, 'kakaoPlaceId'),
  }
}

function toDatabasePayload(cafe: CafePayload): DatabaseCafePayload {
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
    phone: cafe.phone ?? null,
    instagram_handle: cafe.instagramHandle ?? null,
    kakao_place_id: cafe.kakaoPlaceId ?? null,
  }
}

function toCafePayload(databaseCafe: DatabaseCafePayload): CafePayload {
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
    phone: databaseCafe.phone ?? undefined,
    instagramHandle: databaseCafe.instagram_handle ?? undefined,
    kakaoPlaceId: databaseCafe.kakao_place_id ?? undefined,
  }
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function badRequest(error: unknown) {
  let message = 'Invalid request'

  if (error instanceof Error) {
    message = error.message
  } else if (isRecord(error)) {
    const errorParts = ['message', 'details', 'hint', 'code']
      .map((key) => error[key])
      .filter((value): value is string => typeof value === 'string' && value.length > 0)

    if (errorParts.length > 0) {
      message = errorParts.join(' / ')
    }
  }

  return NextResponse.json({ error: message }, { status: 400 })
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  try {
    const { data, error } = await createSupabaseAdminClient()
      .from('cafes')
      .select('*')
      .order('quality_score', { ascending: false })

    if (error) throw error

    return NextResponse.json((data as DatabaseCafePayload[]).map(toCafePayload), {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    return badRequest(error)
  }
}

async function saveCafe(payload: DatabaseCafePayload) {
  const supabase = createSupabaseAdminClient()

  if (payload.kakao_place_id) {
    const { data: existingCafe, error: findError } = await supabase
      .from('cafes')
      .select('id')
      .eq('kakao_place_id', payload.kakao_place_id)
      .maybeSingle<{ id: string }>()

    if (findError) throw findError

    if (existingCafe) {
      return supabase
        .from('cafes')
        .update({ ...payload, id: existingCafe.id })
        .eq('id', existingCafe.id)
        .select()
        .single()
    }
  }

  return supabase
    .from('cafes')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single()
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  try {
    const payload = toDatabasePayload(readCafePayload(await request.json()))
    const { data, error } = await saveCafe(payload)

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return badRequest(error)
  }
}

export async function PUT(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  try {
    const payload = toDatabasePayload(readCafePayload(await request.json()))
    const { data, error } = await createSupabaseAdminClient()
      .from('cafes')
      .update(payload)
      .eq('id', payload.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return badRequest(error)
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  const id = request.nextUrl.searchParams.get('id')

  if (id === null) {
    return NextResponse.json({ error: '"id" query parameter is required' }, { status: 400 })
  }

  const { error } = await createSupabaseAdminClient()
    .from('cafes')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
