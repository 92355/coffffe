import { NextRequest, NextResponse } from 'next/server'
import { extractClientIdentity } from '@/lib/clientIdentity'
import { deleteReviewByUser, updateReviewByUser } from '@/lib/cafeFootprint'
import { getUserSession } from '@/lib/user-auth'

const TEXT_MAX_LENGTH = 50

interface RouteContext {
  params: Promise<{ id: string; reviewId: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { reviewId } = await context.params
  if (!reviewId) return NextResponse.json({ error: 'review id required' }, { status: 400 })

  const { anonymousId } = extractClientIdentity(request)
  if (!anonymousId) return NextResponse.json({ error: 'anonymous id required' }, { status: 400 })

  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }

  const bodyRecord = (body ?? {}) as Record<string, unknown>
  const text = typeof bodyRecord.text === 'string' ? bodyRecord.text.trim() : ''
  if (text.length === 0 || text.length > TEXT_MAX_LENGTH) {
    return NextResponse.json({ error: `text must be 1-${TEXT_MAX_LENGTH} characters` }, { status: 400 })
  }

  const session = await getUserSession()
  const userId = session?.userId ?? null

  try {
    const review = await updateReviewByUser(reviewId, text, anonymousId, userId)
    if (!review) return NextResponse.json({ error: 'not found or not authorized' }, { status: 403 })
    return NextResponse.json({ review })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'update failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { reviewId } = await context.params
  if (!reviewId) return NextResponse.json({ error: 'review id required' }, { status: 400 })

  const { anonymousId } = extractClientIdentity(request)
  if (!anonymousId) return NextResponse.json({ error: 'anonymous id required' }, { status: 400 })

  const session = await getUserSession()
  const userId = session?.userId ?? null

  try {
    const deleted = await deleteReviewByUser(reviewId, anonymousId, userId)
    if (!deleted) return NextResponse.json({ error: 'not found or not authorized' }, { status: 403 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'delete failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
