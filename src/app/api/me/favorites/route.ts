import { NextRequest } from 'next/server'
import { getUserSession } from '@/lib/user-auth'
import { getFavorites, addFavorite, removeFavorite } from '@/lib/repositories/user'
import { unauthorized, badRequest, ok, created, serverError } from '@/lib/response'

const MAX_CAFE_ID_LENGTH = 120

export async function GET() {
  const session = await getUserSession()
  if (!session) return unauthorized()

  try {
    const cafeIds = await getFavorites(session.userId)
    return ok({ cafeIds })
  } catch (error) {
    return serverError(error instanceof Error ? error.message : 'Unknown favorite cafe error')
  }
}

export async function POST(request: NextRequest) {
  const session = await getUserSession()
  if (!session) return unauthorized()

  try {
    const payload = readPayload(await request.json())
    await addFavorite(session.userId, payload.cafeId)
    return created({ ok: true })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Invalid request')
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getUserSession()
  if (!session) return unauthorized()

  try {
    const payload = readPayload(await request.json())
    await removeFavorite(session.userId, payload.cafeId)
    return ok({ ok: true })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Invalid request')
  }
}

function readPayload(value: unknown): { cafeId: string } {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Request body must be an object')
  }
  const cafeId = (value as Record<string, unknown>).cafeId
  if (typeof cafeId !== 'string' || cafeId.trim().length === 0) {
    throw new Error('"cafeId" must be a non-empty string')
  }
  return { cafeId: cafeId.trim().slice(0, MAX_CAFE_ID_LENGTH) }
}
