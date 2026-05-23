import { NextRequest, NextResponse } from 'next/server'
import { isAuthorizedAdminRequest } from '@/lib/admin-auth'
import { deleteReview } from '@/lib/cafeFootprint'

interface RouteContext {
  params: Promise<{ reviewId: string }>
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { reviewId } = await context.params
  if (!reviewId) {
    return NextResponse.json({ error: 'review id is required' }, { status: 400 })
  }

  try {
    await deleteReview(reviewId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'review delete failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
