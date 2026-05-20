import { NextRequest, NextResponse } from 'next/server'
import { isAuthorizedAdminRequest } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'

const CAFE_IMAGES_BUCKET = 'cafe-images'
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

function createStoragePath(file: File, cafeId: string): string {
  const safeCafeId = cafeId.trim().replace(/[^a-zA-Z0-9_-]+/g, '-') || 'unassigned'
  const safeFileName = file.name.trim().replace(/[^a-zA-Z0-9._-]+/g, '-') || 'image'

  return `${safeCafeId}/${Date.now()}-${safeFileName}`
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  const formData = await request.formData()
  const file = formData.get('file')
  const cafeId = formData.get('cafeId')

  if (!(file instanceof File)) {
    return badRequest('"file" is required')
  }

  if (typeof cafeId !== 'string') {
    return badRequest('"cafeId" is required')
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return badRequest('지원하지 않는 이미지 형식입니다.')
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return badRequest('이미지는 최대 5MB까지 업로드할 수 있습니다.')
  }

  const supabase = createSupabaseAdminClient()
  const path = createStoragePath(file, cafeId)
  const { error } = await supabase.storage
    .from(CAFE_IMAGES_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const { data } = supabase.storage
    .from(CAFE_IMAGES_BUCKET)
    .getPublicUrl(path)

  return NextResponse.json({ url: data.publicUrl })
}
