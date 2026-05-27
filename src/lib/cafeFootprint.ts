import 'server-only'

import { checkReviewRateLimit } from './footprintRateLimit'
import { FOOTPRINT_EMOJIS, type FootprintEmojiKey } from './footprintEmojis'
import { todayKstDateString } from './kstDate'
import {
  incrementViewRpc,
  getTodayViewCount,
  upsertVisit,
  getVisitsForDate,
  getReactions,
  findReaction,
  insertReactionRow,
  deleteReactionRow,
  countReactions,
  queryReviews,
  queryAllReviews,
  insertReviewRow,
  updateReviewRow,
  deleteReviewRow,
  deleteReviewByIdRow,
  findLastReviewByIdentifiers,
  upsertReviewReport,
  incrementReviewReportCount,
  type ReviewDbRow,
} from './repositories/footprint'

const REVIEW_COOLDOWN_HOURS = 24
const REVIEW_LIST_DEFAULT_LIMIT = 50
const REVIEW_TEXT_MAX_LENGTH = 50

// ============================================================
// Public types
// ============================================================

export interface FootprintReactionSummary {
  emoji: FootprintEmojiKey
  count: number
  mine: boolean
}

export interface FootprintSummary {
  views: { today: number }
  visits: { today: number; didIVisit: boolean }
  reactions: FootprintReactionSummary[]
}

export interface ReviewRecord {
  id: string
  cafeId: string
  authorUserId: string | null
  authorAnonymousId: string
  authorNickname: string
  authorAnimal: string
  text: string
  reportCount: number
  createdAt: string
}

export interface InsertReviewInput {
  cafeId: string
  text: string
  authorUserId: string | null
  anonymousId: string
  nickname: string
  animal: string
  ip: string
}

export class CooldownError extends Error {
  readonly code = 'COOLDOWN'
  readonly retryAfterSeconds: number

  constructor(retryAfterSeconds: number) {
    super(`Review cooldown active. Retry after ${retryAfterSeconds}s.`)
    this.retryAfterSeconds = retryAfterSeconds
  }
}

function mapReviewRow(row: ReviewDbRow): ReviewRecord {
  return {
    id: row.id,
    cafeId: row.cafe_id,
    authorUserId: row.author_user_id,
    authorAnonymousId: row.author_anonymous_id,
    authorNickname: row.author_nickname,
    authorAnimal: row.author_animal,
    text: row.text,
    reportCount: row.report_count,
    createdAt: row.created_at,
  }
}

// ============================================================
// Views
// ============================================================

export async function recordView(cafeId: string): Promise<void> {
  await incrementViewRpc(cafeId, todayKstDateString())
}

// ============================================================
// Visits
// ============================================================

export async function recordVisit(cafeId: string, anonymousId: string): Promise<void> {
  await upsertVisit(cafeId, anonymousId, todayKstDateString())
}

// ============================================================
// Reactions
// ============================================================

export interface ToggleReactionResult {
  emoji: FootprintEmojiKey
  count: number
  mine: boolean
}

export async function toggleReaction(
  cafeId: string,
  anonymousId: string,
  emoji: FootprintEmojiKey,
): Promise<ToggleReactionResult> {
  const exists = await findReaction(cafeId, anonymousId, emoji)

  let mine: boolean
  if (exists) {
    await deleteReactionRow(cafeId, anonymousId, emoji)
    mine = false
  } else {
    await insertReactionRow(cafeId, anonymousId, emoji)
    mine = true
  }

  const count = await countReactions(cafeId, emoji)
  return { emoji, count, mine }
}

// ============================================================
// Reviews
// ============================================================

export async function listReviews(
  cafeId: string,
  limit: number = REVIEW_LIST_DEFAULT_LIMIT,
): Promise<ReviewRecord[]> {
  const rows = await queryReviews(cafeId, limit)
  return rows.map(mapReviewRow)
}

export async function insertReview(input: InsertReviewInput): Promise<ReviewRecord> {
  const text = input.text.trim()
  if (text.length === 0 || text.length > REVIEW_TEXT_MAX_LENGTH) {
    throw new Error(`Review text length must be 1-${REVIEW_TEXT_MAX_LENGTH} characters`)
  }

  const lastCreatedAt = await findLastReviewByIdentifiers(input.cafeId, input.ip, input.anonymousId)
  const limit = checkReviewRateLimit({
    lastCreatedAt,
    windowHours: REVIEW_COOLDOWN_HOURS,
    now: new Date(),
  })

  if (!limit.allowed) {
    throw new CooldownError(limit.retryAfterSeconds)
  }

  const row = await insertReviewRow({
    cafe_id: input.cafeId,
    author_user_id: input.authorUserId,
    author_anonymous_id: input.anonymousId,
    author_nickname: input.nickname,
    author_animal: input.animal,
    ip: input.ip,
    text,
  })

  return mapReviewRow(row)
}

export async function updateReviewByUser(
  reviewId: string,
  text: string,
  anonymousId: string,
  userId: string | null,
): Promise<ReviewRecord | null> {
  const row = await updateReviewRow(reviewId, text, userId, anonymousId)
  return row ? mapReviewRow(row) : null
}

export async function deleteReviewByUser(
  reviewId: string,
  anonymousId: string,
  userId: string | null,
): Promise<boolean> {
  return deleteReviewRow(reviewId, userId, anonymousId)
}

export async function deleteReview(reviewId: string): Promise<void> {
  await deleteReviewByIdRow(reviewId)
}

export async function reportReview(reviewId: string, reporterAnonymousId: string): Promise<void> {
  const count = await upsertReviewReport(reviewId, reporterAnonymousId)
  if (count > 0) {
    await incrementReviewReportCount(reviewId)
  }
}

export interface AdminReviewRecord extends ReviewRecord {
  cafeId: string
}

export async function listAllReviewsForAdmin(limit: number = 200): Promise<AdminReviewRecord[]> {
  const rows = await queryAllReviews(limit)
  return rows.map(mapReviewRow)
}

// ============================================================
// Summary (combined)
// ============================================================

export async function getFootprintSummary(
  cafeId: string,
  anonymousId: string | null,
): Promise<FootprintSummary> {
  const today = todayKstDateString()

  const [viewCount, visits, reactionRows] = await Promise.all([
    getTodayViewCount(cafeId, today),
    getVisitsForDate(cafeId, today),
    getReactions(cafeId),
  ])

  const didIVisit = anonymousId !== null && visits.some((row) => row.anonymous_id === anonymousId)

  const countByEmoji = new Map<FootprintEmojiKey, number>()
  const mineByEmoji = new Set<FootprintEmojiKey>()

  for (const row of reactionRows) {
    countByEmoji.set(row.emoji, (countByEmoji.get(row.emoji) ?? 0) + 1)
    if (anonymousId !== null && row.anonymous_id === anonymousId) {
      mineByEmoji.add(row.emoji)
    }
  }

  const reactions: FootprintReactionSummary[] = FOOTPRINT_EMOJIS.map((meta) => ({
    emoji: meta.key,
    count: countByEmoji.get(meta.key) ?? 0,
    mine: mineByEmoji.has(meta.key),
  }))

  return {
    views: { today: viewCount },
    visits: { today: visits.length, didIVisit },
    reactions,
  }
}
