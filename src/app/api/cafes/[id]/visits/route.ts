import { NextRequest } from 'next/server'
import { extractClientIdentity } from '@/lib/clientIdentity'
import { recordVisit } from '@/lib/cafeFootprint'
import { badRequest, created, serverError } from '@/lib/response'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  if (!id) return badRequest('cafe id is required')

  const { anonymousId } = extractClientIdentity(request)
  if (!anonymousId) return badRequest('anonymous id required')

  try {
    await recordVisit(id, anonymousId)
    return created({ ok: true })
  } catch (error) {
    return serverError(error instanceof Error ? error.message : 'visit failed')
  }
}
