import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getUserSession } from '@/lib/user-auth'

const MAX_RESULT_LENGTH = 16

export async function GET() {
  const session = await getUserSession()
  if (!session) return unauthorized()

  const { data, error } = await createSupabaseAdminClient()
    .from('user_cbti_profiles')
    .select('cbti_type, updated_at')
    .eq('user_id', session.userId)
    .maybeSingle()

  if (error) return serverError(error)

  return NextResponse.json({
    cbtiType: data?.cbti_type ?? null,
    updatedAt: data?.updated_at ?? null,
  })
}

export async function PUT(request: NextRequest) {
  const session = await getUserSession()
  if (!session) return unauthorized()

  try {
    const payload = readPayload(await request.json())
    const { data, error } = await createSupabaseAdminClient()
      .from('user_cbti_profiles')
      .upsert({
        user_id: session.userId,
        cbti_type: payload.cbtiType,
      }, { onConflict: 'user_id' })
      .select('cbti_type, updated_at')
      .single()

    if (error) throw error

    return NextResponse.json({
      ok: true,
      cbtiType: data.cbti_type,
      updatedAt: data.updated_at,
    })
  } catch (error) {
    return badRequest(error)
  }
}

function readPayload(value: unknown): { cbtiType: string } {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Request body must be an object')
  }

  const cbtiType = (value as Record<string, unknown>).cbtiType
  if (typeof cbtiType !== 'string' || cbtiType.trim().length === 0) {
    throw new Error('"cbtiType" must be a non-empty string')
  }

  return {
    cbtiType: cbtiType.trim().slice(0, MAX_RESULT_LENGTH),
  }
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function badRequest(error: unknown) {
  const message = error instanceof Error ? error.message : 'Invalid request'
  return NextResponse.json({ error: message }, { status: 400 })
}

function serverError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown cbti profile error'
  return NextResponse.json({ error: message }, { status: 500 })
}
