import { NextRequest } from 'next/server'
import { extractClientIdentity } from '@/lib/clientIdentity'
import { toggleReaction } from '@/lib/cafeFootprint'
import { isFootprintEmojiKey } from '@/lib/footprintEmojis'
import { badRequest, ok, serverError } from '@/lib/response'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  if (!id) return badRequest('cafe id is required')

  const { anonymousId } = extractClientIdentity(request)
  if (!anonymousId) return badRequest('anonymous id required')

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('invalid json body')
  }

  const emoji = (body as { emoji?: unknown } | null)?.emoji
  if (!isFootprintEmojiKey(emoji)) return badRequest('invalid emoji key')

  try {
    const result = await toggleReaction(id, anonymousId, emoji)
    return ok(result)
  } catch (error) {
    return serverError(error instanceof Error ? error.message : 'reaction toggle failed')
  }
}
