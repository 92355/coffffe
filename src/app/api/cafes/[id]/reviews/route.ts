import { NextRequest } from 'next/server'
import { extractClientIdentity } from '@/lib/clientIdentity'
import { CooldownError, insertReview, listReviews } from '@/lib/cafeFootprint'
import { getUserSession } from '@/lib/user-auth'
import { parseReviewText, parseAnonymousReviewAuthor } from '@/lib/validation/review'
import { badRequest, created, noStore, ok, serverError } from '@/lib/response'

const NICKNAME_MAX_LENGTH = 60

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  if (!id) return badRequest('cafe id is required')

  try {
    const reviews = await listReviews(id)
    return noStore({ reviews })
  } catch (error) {
    return serverError(error instanceof Error ? error.message : 'list reviews failed')
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: cafeId } = await context.params
  if (!cafeId) return badRequest('cafe id is required')

  const { ip, anonymousId } = extractClientIdentity(request)
  if (!anonymousId) return badRequest('anonymous id required')

  let body: Record<string, unknown>
  try {
    const parsed = await request.json()
    body = (parsed ?? {}) as Record<string, unknown>
  } catch {
    return badRequest('invalid json body')
  }

  let text: string
  try {
    text = parseReviewText(body)
  } catch (e) {
    return badRequest(e instanceof Error ? e.message : 'invalid text')
  }

  const session = await getUserSession()
  let authorUserId: string | null
  let nickname: string
  let animal: string

  if (session) {
    authorUserId = session.userId
    nickname = (session.siteNickname ?? session.nickname).slice(0, NICKNAME_MAX_LENGTH)
    animal = session.siteAnimal ?? 'cat'
  } else {
    authorUserId = null
    try {
      const author = parseAnonymousReviewAuthor(body)
      nickname = author.nickname
      animal = author.animal
    } catch (e) {
      return badRequest(e instanceof Error ? e.message : 'invalid author')
    }
  }

  try {
    const review = await insertReview({ cafeId, text, authorUserId, anonymousId, nickname, animal, ip })
    return created({ review })
  } catch (error) {
    if (error instanceof CooldownError) {
      return ok(
        { error: 'cooldown', retryAfterSeconds: error.retryAfterSeconds },
        { status: 429, headers: { 'Retry-After': String(error.retryAfterSeconds) } },
      )
    }
    return serverError(error instanceof Error ? error.message : 'review insert failed')
  }
}
