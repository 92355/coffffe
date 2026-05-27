import { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import { isAuthorizedAdminRequest } from '@/lib/admin-auth'
import { adminListCafes, adminSaveCafe, adminUpdateCafe, adminDeleteCafe } from '@/lib/services/admin'
import { unauthorized, badRequest, ok, created, noStore, parseErrorMessage } from '@/lib/response'
import { CAFES_CACHE_TAG } from '@/app/api/cafes/route'

export async function GET(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  try {
    const cafes = await adminListCafes()
    return noStore(cafes)
  } catch (error) {
    return badRequest(parseErrorMessage(error))
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  try {
    const cafe = await adminSaveCafe(await request.json())
    revalidateTag(CAFES_CACHE_TAG, 'max')
    return created(cafe)
  } catch (error) {
    return badRequest(parseErrorMessage(error))
  }
}

export async function PUT(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  try {
    const cafe = await adminUpdateCafe(await request.json())
    revalidateTag(CAFES_CACHE_TAG, 'max')
    return ok(cafe)
  } catch (error) {
    return badRequest(parseErrorMessage(error))
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return badRequest('"id" query parameter is required')

  try {
    await adminDeleteCafe(id)
    revalidateTag(CAFES_CACHE_TAG, 'max')
    return ok({ ok: true })
  } catch (error) {
    return badRequest(parseErrorMessage(error))
  }
}
