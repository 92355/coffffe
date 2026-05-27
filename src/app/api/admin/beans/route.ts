import { NextRequest } from 'next/server'
import { isAuthorizedAdminRequest } from '@/lib/admin-auth'
import { adminInsertBean, adminUpdateBean, adminDeleteBean } from '@/lib/services/admin'
import { unauthorized, badRequest, ok, created } from '@/lib/response'

export async function POST(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  try {
    await adminInsertBean(await request.json())
    return created({ ok: true })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : String(error))
  }
}

export async function PUT(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  try {
    await adminUpdateBean(await request.json())
    return ok({ ok: true })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : String(error))
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return badRequest('id required')

  try {
    await adminDeleteBean(id)
    return ok({ ok: true })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : String(error))
  }
}
