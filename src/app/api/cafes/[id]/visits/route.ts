import { NextRequest, NextResponse } from 'next/server'
import { extractClientIdentity } from '@/lib/clientIdentity'
import { recordVisit } from '@/lib/cafeFootprint'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'cafe id is required' }, { status: 400 })
  }

  const { anonymousId } = extractClientIdentity(request)
  if (!anonymousId) {
    return NextResponse.json({ error: 'anonymous id required' }, { status: 400 })
  }

  try {
    await recordVisit(id, anonymousId)
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'visit failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
