import { NextRequest } from 'next/server'
import { isAuthorizedAdminRequest } from '@/lib/admin-auth'
import { listAllReviewsForAdmin } from '@/lib/cafeFootprint'
import { unauthorized, noStore, serverError } from '@/lib/response'

export async function GET(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  try {
    const reviews = await listAllReviewsForAdmin()
    return noStore({ reviews })
  } catch (error) {
    return serverError(error instanceof Error ? error.message : 'admin reviews failed')
  }
}
