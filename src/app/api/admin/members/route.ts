import { NextRequest } from 'next/server'
import { isAuthorizedAdminRequest } from '@/lib/admin-auth'
import { listMembers, updateMember, deleteMember } from '@/lib/repositories/admin'
import { unauthorized, badRequest, ok, serverError } from '@/lib/response'

export async function GET(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  const members = await listMembers()
  return ok(members)
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  const body = await request.json() as {
    id: string
    site_nickname?: string
    site_animal?: string
    profile_image_url?: string
    cbti_type?: string | null
  }

  if (!body.id) return badRequest('id required')

  try {
    await updateMember(body)
    return ok({ ok: true })
  } catch (error) {
    return serverError(error instanceof Error ? error.message : 'update failed')
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return badRequest('id required')

  try {
    await deleteMember(id)
    return ok({ ok: true })
  } catch (error) {
    return serverError(error instanceof Error ? error.message : 'delete failed')
  }
}
