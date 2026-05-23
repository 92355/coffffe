import { NextRequest, NextResponse } from 'next/server'
import { recordView } from '@/lib/cafeFootprint'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params

  if (!id) {
    return NextResponse.json({ error: 'cafe id is required' }, { status: 400 })
  }

  try {
    await recordView(id)
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'view tracking failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
