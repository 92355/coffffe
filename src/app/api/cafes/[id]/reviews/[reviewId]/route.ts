import { NextRequest } from 'next/server'
import { extractClientIdentity } from '@/lib/clientIdentity'
import { deleteReviewByUser, updateReviewByUser } from '@/lib/cafeFootprint'
import { getUserSession } from '@/lib/user-auth'
import { badRequest, ok, forbidden, serverError } from '@/lib/response'

const TEXT_MAX_LENGTH = 50

interface RouteContext {
  params: Promise<{ id: string; reviewId: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { reviewId } = await context.params
  if (!reviewId) return badRequest('review id required')

  const { anonymousId } = extractClientIdentity(request)
  if (!anonymousId) return badRequest('anonymous id required')

  let body: unknown
  try { body = await request.json() } catch { return badRequest('invalid json') }

  const bodyRecord = (body ?? {}) as Record<string, unknown>
  const text = typeof bodyRecord.text === 'string' ? bodyRecord.text.trim() : ''
  if (text.length === 0 || text.length > TEXT_MAX_LENGTH) {
    return badRequest(`text must be 1-${TEXT_MAX_LENGTH} characters`)
  }

  const session = await getUserSession()
  const userId = session?.userId ?? null

  try {
    const review = await updateReviewByUser(reviewId, text, anonymousId, userId)
    if (!review) return forbidden('not found or not authorized')
    return ok({ review })
  } catch (error) {
    return serverError(error instanceof Error ? error.message : 'update failed')
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { reviewId } = await context.params
  if (!reviewId) return badRequest('review id required')

  const { anonymousId } = extractClientIdentity(request)
  if (!anonymousId) return badRequest('anonymous id required')

  const session = await getUserSession()
  const userId = session?.userId ?? null

  try {
    const deleted = await deleteReviewByUser(reviewId, anonymousId, userId)
    if (!deleted) return forbidden('not found or not authorized')
    return ok({ ok: true })
  } catch (error) {
    return serverError(error instanceof Error ? error.message : 'delete failed')
  }
}
