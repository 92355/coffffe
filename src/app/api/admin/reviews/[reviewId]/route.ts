import { NextRequest } from 'next/server'
import { isAuthorizedAdminRequest } from '@/lib/admin-auth'
import { deleteReview } from '@/lib/cafeFootprint'
import { unauthorized, badRequest, ok, serverError } from '@/lib/response'

interface RouteContext {
  params: Promise<{ reviewId: string }>
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  const { reviewId } = await context.params
  if (!reviewId) return badRequest('review id is required')

  try {
    await deleteReview(reviewId)
    return ok({ ok: true })
  } catch (error) {
    return serverError(error instanceof Error ? error.message : 'review delete failed')
  }
}
