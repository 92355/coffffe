import { NextRequest, NextResponse } from 'next/server'
import { extractClientIdentity } from '@/lib/clientIdentity'
import { reportReview } from '@/lib/cafeFootprint'

interface RouteContext {
  params: Promise<{ id: string; reviewId: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { reviewId } = await context.params
  if (!reviewId) {
    return NextResponse.json({ error: 'review id is required' }, { status: 400 })
  }

  const { anonymousId } = extractClientIdentity(request)
  if (!anonymousId) {
    return NextResponse.json({ error: 'anonymous id required' }, { status: 400 })
  }

  try {
    await reportReview(reviewId, anonymousId)
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'report failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
