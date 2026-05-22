import { NextRequest, NextResponse } from 'next/server'
import { isAuthorizedAdminRequest } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const userId = formData.get('userId') as string | null

  if (!file || !userId) {
    return NextResponse.json({ error: 'file and userId required' }, { status: 400 })
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: '파일 크기는 2MB 이하여야 합니다.' }, { status: 400 })
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${userId}.${ext}`

  const supabase = createSupabaseAdminClient()

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)

  const { error: updateError } = await supabase
    .from('users')
    .update({ profile_image_url: data.publicUrl })
    .eq('id', userId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ url: data.publicUrl })
}
