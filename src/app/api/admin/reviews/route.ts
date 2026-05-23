import { NextRequest, NextResponse } from 'next/server'
import { isAuthorizedAdminRequest } from '@/lib/admin-auth'
import { listAllReviewsForAdmin } from '@/lib/cafeFootprint'

export async function GET(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const reviews = await listAllReviewsForAdmin()
    return NextResponse.json({ reviews }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'admin reviews failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
