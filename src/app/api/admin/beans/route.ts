import { NextRequest, NextResponse } from 'next/server'
import { isAuthorizedAdminRequest } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function requireString(r: Record<string, unknown>, key: string): string {
  const v = r[key]
  if (typeof v !== 'string' || !v.trim()) throw new Error(`"${key}" is required`)
  return v.trim()
}

function optionalString(r: Record<string, unknown>, key: string): string | null {
  const v = r[key]
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

function requireStringArray(r: Record<string, unknown>, key: string): string[] {
  const v = r[key]
  if (!Array.isArray(v)) throw new Error(`"${key}" must be an array`)
  return v.filter((item): item is string => typeof item === 'string')
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: unknown = await request.json()
    if (!isRecord(body)) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

    const row = {
      id: requireString(body, 'id'),
      name: requireString(body, 'name'),
      name_en: requireString(body, 'nameEn'),
      origin: requireString(body, 'origin'),
      region: requireString(body, 'region'),
      variety: requireString(body, 'variety'),
      process: requireString(body, 'process'),
      roast: requireString(body, 'roast'),
      notes: requireStringArray(body, 'notes'),
      body: requireString(body, 'body'),
      acidity: requireString(body, 'acidity'),
      description: requireString(body, 'desc'),
      flag: requireString(body, 'flag'),
      special: optionalString(body, 'special'),
    }

    const supabase = createSupabaseAdminClient()
    const { error } = await supabase.from('beans').insert(row)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: unknown = await request.json()
    if (!isRecord(body)) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

    const id = requireString(body, 'id')
    const row = {
      name: requireString(body, 'name'),
      name_en: requireString(body, 'nameEn'),
      origin: requireString(body, 'origin'),
      region: requireString(body, 'region'),
      variety: requireString(body, 'variety'),
      process: requireString(body, 'process'),
      roast: requireString(body, 'roast'),
      notes: requireStringArray(body, 'notes'),
      body: requireString(body, 'body'),
      acidity: requireString(body, 'acidity'),
      description: requireString(body, 'desc'),
      flag: requireString(body, 'flag'),
      special: optionalString(body, 'special'),
    }

    const supabase = createSupabaseAdminClient()
    const { error } = await supabase.from('beans').update(row).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('beans').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
