import { NextRequest, NextResponse } from 'next/server'
import { extractClientIdentity } from '@/lib/clientIdentity'
import { CooldownError, insertReview, listReviews } from '@/lib/cafeFootprint'
import { getUserSession } from '@/lib/user-auth'
import { isNicknameAnimal } from '@/lib/nickname'

const TEXT_MAX_LENGTH = 50
const NICKNAME_MAX_LENGTH = 60

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'cafe id is required' }, { status: 400 })
  }

  try {
    const reviews = await listReviews(id)
    return NextResponse.json({ reviews }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'list reviews failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: cafeId } = await context.params
  if (!cafeId) {
    return NextResponse.json({ error: 'cafe id is required' }, { status: 400 })
  }

  const { ip, anonymousId } = extractClientIdentity(request)
  if (!anonymousId) {
    return NextResponse.json({ error: 'anonymous id required' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid json body' }, { status: 400 })
  }

  const bodyRecord = (body ?? {}) as Record<string, unknown>
  const text = typeof bodyRecord.text === 'string' ? bodyRecord.text.trim() : ''
  if (text.length === 0 || text.length > TEXT_MAX_LENGTH) {
    return NextResponse.json({ error: `text must be 1-${TEXT_MAX_LENGTH} characters` }, { status: 400 })
  }

  // Identity: logged-in 사용자면 server session에서, 아니면 요청 본문에서 닉네임/animal 받음.
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
    const rawNickname = typeof bodyRecord.nickname === 'string' ? bodyRecord.nickname.trim() : ''
    const rawAnimal = typeof bodyRecord.animal === 'string' ? bodyRecord.animal : ''
    if (rawNickname.length === 0 || !isNicknameAnimal(rawAnimal)) {
      return NextResponse.json({ error: 'nickname and animal required for anonymous review' }, { status: 400 })
    }
    nickname = rawNickname.slice(0, NICKNAME_MAX_LENGTH)
    animal = rawAnimal
  }

  try {
    const review = await insertReview({
      cafeId,
      text,
      authorUserId,
      anonymousId,
      nickname,
      animal,
      ip,
    })
    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    if (error instanceof CooldownError) {
      return NextResponse.json(
        { error: 'cooldown', retryAfterSeconds: error.retryAfterSeconds },
        { status: 429, headers: { 'Retry-After': String(error.retryAfterSeconds) } },
      )
    }
    const message = error instanceof Error ? error.message : 'review insert failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
