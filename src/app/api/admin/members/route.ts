import { NextRequest, NextResponse } from 'next/server'
import { isAuthorizedAdminRequest } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'

type UserRow = {
  id: string
  kakao_id: string
  site_nickname: string | null
  site_animal: string | null
  nickname: string
  profile_image_url: string | null
  created_at: string
  user_cbti_profiles: { cbti_type: string }[]
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, kakao_id, site_nickname, site_animal, nickname, profile_image_url, created_at, user_cbti_profiles(cbti_type)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const members = (data as UserRow[] ?? []).map(row => ({
    id: row.id,
    kakao_id: row.kakao_id,
    site_nickname: row.site_nickname,
    site_animal: row.site_animal,
    nickname: row.nickname,
    profile_image_url: row.profile_image_url,
    created_at: row.created_at,
    cbti_type: row.user_cbti_profiles?.[0]?.cbti_type ?? null,
  }))

  return NextResponse.json(members)
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as {
    id: string
    site_nickname?: string
    site_animal?: string
    profile_image_url?: string
    cbti_type?: string | null
  }

  if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = createSupabaseAdminClient()

  const userUpdate: Record<string, unknown> = {}
  if (body.site_nickname !== undefined) userUpdate.site_nickname = body.site_nickname
  if (body.site_animal !== undefined) userUpdate.site_animal = body.site_animal
  if (body.profile_image_url !== undefined) userUpdate.profile_image_url = body.profile_image_url || null

  if (Object.keys(userUpdate).length > 0) {
    const { error } = await supabase.from('users').update(userUpdate).eq('id', body.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (body.cbti_type !== undefined) {
    if (body.cbti_type) {
      const { error } = await supabase
        .from('user_cbti_profiles')
        .upsert({ user_id: body.id, cbti_type: body.cbti_type }, { onConflict: 'user_id' })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      const { error } = await supabase.from('user_cbti_profiles').delete().eq('user_id', body.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('users').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
