import { NextRequest, NextResponse } from 'next/server'
import { extractClientIdentity } from '@/lib/clientIdentity'
import { toggleReaction } from '@/lib/cafeFootprint'
import { isFootprintEmojiKey } from '@/lib/footprintEmojis'

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

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid json body' }, { status: 400 })
  }

  const emoji = (body as { emoji?: unknown } | null)?.emoji
  if (!isFootprintEmojiKey(emoji)) {
    return NextResponse.json({ error: 'invalid emoji key' }, { status: 400 })
  }

  try {
    const result = await toggleReaction(id, anonymousId, emoji)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'reaction toggle failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
