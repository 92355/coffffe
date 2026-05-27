import { NextRequest } from 'next/server'
import { extractClientIdentity } from '@/lib/clientIdentity'
import { reportReview } from '@/lib/cafeFootprint'
import { badRequest, created, serverError } from '@/lib/response'

interface RouteContext {
  params: Promise<{ id: string; reviewId: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { reviewId } = await context.params
  if (!reviewId) return badRequest('review id is required')

  const { anonymousId } = extractClientIdentity(request)
  if (!anonymousId) return badRequest('anonymous id required')

  try {
    await reportReview(reviewId, anonymousId)
    return created({ ok: true })
  } catch (error) {
    return serverError(error instanceof Error ? error.message : 'report failed')
  }
}
