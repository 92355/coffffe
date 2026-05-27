import { getUserSession } from '@/lib/user-auth'
import { getMyReviews } from '@/lib/repositories/footprint'
import { unauthorized, ok, serverError } from '@/lib/response'

export async function GET() {
  const session = await getUserSession()
  if (!session) return unauthorized()

  try {
    const reviews = await getMyReviews(session.userId)
    return ok({ reviews })
  } catch (error) {
    return serverError(error instanceof Error ? error.message : 'Failed to load reviews')
  }
}
