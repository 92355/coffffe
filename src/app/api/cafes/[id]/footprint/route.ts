import { NextRequest, NextResponse } from 'next/server'
import { extractClientIdentity } from '@/lib/clientIdentity'
import { getFootprintSummary } from '@/lib/cafeFootprint'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'cafe id is required' }, { status: 400 })
  }

  try {
    const { anonymousId } = extractClientIdentity(request)
    const summary = await getFootprintSummary(id, anonymousId)
    return NextResponse.json(summary, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'footprint summary failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
