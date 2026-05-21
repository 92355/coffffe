import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getUserSession } from '@/lib/user-auth'

interface FavoriteCafePayload {
  cafeId: string
}

interface FavoriteCafeRow {
  cafe_id: string
}

const MAX_CAFE_ID_LENGTH = 120

export async function GET() {
  const session = await getUserSession()
  if (!session) return unauthorized()

  const { data, error } = await createSupabaseAdminClient()
    .from('favorite_cafes')
    .select('cafe_id')
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false })

  if (error) return serverError(error)

  return NextResponse.json({
    cafeIds: (data as FavoriteCafeRow[]).map((row) => row.cafe_id),
  })
}

export async function POST(request: NextRequest) {
  const session = await getUserSession()
  if (!session) return unauthorized()

  try {
    const payload = readPayload(await request.json())
    const { error } = await createSupabaseAdminClient()
      .from('favorite_cafes')
      .upsert({
        user_id: session.userId,
        cafe_id: payload.cafeId,
      }, { onConflict: 'user_id,cafe_id' })

    if (error) throw error

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    return badRequest(error)
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getUserSession()
  if (!session) return unauthorized()

  try {
    const payload = readPayload(await request.json())
    const { error } = await createSupabaseAdminClient()
      .from('favorite_cafes')
      .delete()
      .eq('user_id', session.userId)
      .eq('cafe_id', payload.cafeId)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    return badRequest(error)
  }
}

function readPayload(value: unknown): FavoriteCafePayload {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Request body must be an object')
  }

  const cafeId = (value as Record<string, unknown>).cafeId
  if (typeof cafeId !== 'string' || cafeId.trim().length === 0) {
    throw new Error('"cafeId" must be a non-empty string')
  }

  return { cafeId: cafeId.trim().slice(0, MAX_CAFE_ID_LENGTH) }
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function badRequest(error: unknown) {
  const message = error instanceof Error ? error.message : 'Invalid request'

  return NextResponse.json({ error: message }, { status: 400 })
}

function serverError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown favorite cafe error'

  return NextResponse.json({ error: message }, { status: 500 })
}
