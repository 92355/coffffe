import { NextRequest } from 'next/server'
import { recordView } from '@/lib/cafeFootprint'
import { badRequest, created, serverError } from '@/lib/response'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  if (!id) return badRequest('cafe id is required')

  try {
    await recordView(id)
    return created({ ok: true })
  } catch (error) {
    return serverError(error instanceof Error ? error.message : 'view tracking failed')
  }
}
