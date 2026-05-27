import { NextRequest } from 'next/server'
import { isAuthorizedAdminRequest } from '@/lib/admin-auth'
import { uploadAvatar } from '@/lib/repositories/admin'
import { unauthorized, badRequest, ok, serverError } from '@/lib/response'

export async function POST(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const userId = formData.get('userId') as string | null

  if (!file || !userId) return badRequest('file and userId required')
  if (file.size > 2 * 1024 * 1024) return badRequest('파일 크기는 2MB 이하여야 합니다.')

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${userId}.${ext}`

  try {
    const url = await uploadAvatar(path, file, userId)
    return ok({ url })
  } catch (error) {
    return serverError(error instanceof Error ? error.message : 'avatar upload failed')
  }
}
