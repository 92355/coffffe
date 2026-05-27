import { NextRequest } from 'next/server'
import { extractClientIdentity } from '@/lib/clientIdentity'
import { getFootprintSummary } from '@/lib/cafeFootprint'
import { badRequest, noStore, serverError } from '@/lib/response'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  if (!id) return badRequest('cafe id is required')

  try {
    const { anonymousId } = extractClientIdentity(request)
    const summary = await getFootprintSummary(id, anonymousId)
    return noStore(summary)
  } catch (error) {
    return serverError(error instanceof Error ? error.message : 'footprint summary failed')
  }
}
