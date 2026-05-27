import { NextRequest } from 'next/server'
import { getUserSession } from '@/lib/user-auth'
import { getCbtiProfile, upsertCbtiProfile } from '@/lib/repositories/user'
import { unauthorized, badRequest, ok, serverError } from '@/lib/response'

const MAX_RESULT_LENGTH = 16

export async function GET() {
  const session = await getUserSession()
  if (!session) return unauthorized()

  try {
    const profile = await getCbtiProfile(session.userId)
    return ok({ cbtiType: profile.cbtiType, updatedAt: profile.updatedAt })
  } catch (error) {
    return serverError(error instanceof Error ? error.message : 'Unknown cbti profile error')
  }
}

export async function PUT(request: NextRequest) {
  const session = await getUserSession()
  if (!session) return unauthorized()

  try {
    const payload = readPayload(await request.json())
    const profile = await upsertCbtiProfile(session.userId, payload.cbtiType)
    return ok({ ok: true, cbtiType: profile.cbtiType, updatedAt: profile.updatedAt })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Invalid request')
  }
}

function readPayload(value: unknown): { cbtiType: string } {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Request body must be an object')
  }
  const cbtiType = (value as Record<string, unknown>).cbtiType
  if (typeof cbtiType !== 'string' || cbtiType.trim().length === 0) {
    throw new Error('"cbtiType" must be a non-empty string')
  }
  return { cbtiType: cbtiType.trim().slice(0, MAX_RESULT_LENGTH) }
}
