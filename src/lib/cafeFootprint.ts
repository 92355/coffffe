import 'server-only'

import { createSupabaseAdminClient } from './supabase'
import { checkReviewRateLimit } from './footprintRateLimit'
import { FOOTPRINT_EMOJIS, type FootprintEmojiKey } from './footprintEmojis'
import { todayKstDateString } from './kstDate'

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

// ============================================================
// Views
// ============================================================

export async function recordView(cafeId: string): Promise<void> {
  const supabase = createSupabaseAdminClient()
  const today = todayKstDateString()

  const { error } = await supabase.rpc('increment_cafe_view', {
    p_cafe_id: cafeId,
    p_view_date: today,
  })

  if (error) throw error
}

async function getTodayViewCount(cafeId: string, today: string): Promise<number> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('cafe_view_daily')
    .select('count')
    .eq('cafe_id', cafeId)
    .eq('view_date', today)
    .maybeSingle()

  if (error) throw error

  const row = data as { count: number } | null
  return row?.count ?? 0
}

// ============================================================
// Visits
// ============================================================

export async function recordVisit(cafeId: string, anonymousId: string): Promise<void> {
  const supabase = createSupabaseAdminClient()
  const today = todayKstDateString()

  const { error } = await supabase
    .from('cafe_visits')
    .upsert(
      { cafe_id: cafeId, anonymous_id: anonymousId, visit_date: today },
      { onConflict: 'cafe_id,anonymous_id,visit_date', ignoreDuplicates: true },
    )

  if (error) throw error
}

interface VisitRow {
  anonymous_id: string
}

async function getTodayVisitData(
  cafeId: string,
  anonymousId: string | null,
  today: string,
): Promise<{ count: number; didIVisit: boolean }> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('cafe_visits')
    .select('anonymous_id')
    .eq('cafe_id', cafeId)
    .eq('visit_date', today)

  if (error) throw error

  const rows = (data ?? []) as VisitRow[]
  const didIVisit = anonymousId !== null && rows.some((row) => row.anonymous_id === anonymousId)

  return { count: rows.length, didIVisit }
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
  const supabase = createSupabaseAdminClient()

  const { data: existing, error: selectError } = await supabase
    .from('cafe_reactions')
    .select('cafe_id')
    .eq('cafe_id', cafeId)
    .eq('anonymous_id', anonymousId)
    .eq('emoji', emoji)
    .maybeSingle()

  if (selectError) throw selectError

  let mine: boolean

  if (existing) {
    const { error: deleteError } = await supabase
      .from('cafe_reactions')
      .delete()
      .eq('cafe_id', cafeId)
      .eq('anonymous_id', anonymousId)
      .eq('emoji', emoji)

    if (deleteError) throw deleteError
    mine = false
  } else {
    const { error: insertError } = await supabase
      .from('cafe_reactions')
      .insert({ cafe_id: cafeId, anonymous_id: anonymousId, emoji })

    if (insertError) throw insertError
    mine = true
  }

  const { count, error: countError } = await supabase
    .from('cafe_reactions')
    .select('*', { count: 'exact', head: true })
    .eq('cafe_id', cafeId)
    .eq('emoji', emoji)

  if (countError) throw countError

  return { emoji, count: count ?? 0, mine }
}

interface ReactionRow {
  emoji: FootprintEmojiKey
  anonymous_id: string
}

async function getReactionSummary(
  cafeId: string,
  anonymousId: string | null,
): Promise<FootprintReactionSummary[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('cafe_reactions')
    .select('emoji, anonymous_id')
    .eq('cafe_id', cafeId)

  if (error) throw error

  const rows = (data ?? []) as ReactionRow[]
  const countByEmoji = new Map<FootprintEmojiKey, number>()
  const mineByEmoji = new Set<FootprintEmojiKey>()

  for (const row of rows) {
    countByEmoji.set(row.emoji, (countByEmoji.get(row.emoji) ?? 0) + 1)
    if (anonymousId !== null && row.anonymous_id === anonymousId) {
      mineByEmoji.add(row.emoji)
    }
  }

  return FOOTPRINT_EMOJIS.map((meta) => ({
    emoji: meta.key,
    count: countByEmoji.get(meta.key) ?? 0,
    mine: mineByEmoji.has(meta.key),
  }))
}

// ============================================================
// Reviews
// ============================================================

interface ReviewDbRow {
  id: string
  cafe_id: string
  author_user_id: string | null
  author_anonymous_id: string
  author_nickname: string
  author_animal: string
  text: string
  report_count: number
  created_at: string
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

export async function listReviews(
  cafeId: string,
  limit: number = REVIEW_LIST_DEFAULT_LIMIT,
): Promise<ReviewRecord[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('cafe_reviews')
    .select('id, cafe_id, author_user_id, author_anonymous_id, author_nickname, author_animal, text, report_count, created_at')
    .eq('cafe_id', cafeId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return ((data ?? []) as ReviewDbRow[]).map(mapReviewRow)
}

export async function insertReview(input: InsertReviewInput): Promise<ReviewRecord> {
  const text = input.text.trim()
  if (text.length === 0 || text.length > REVIEW_TEXT_MAX_LENGTH) {
    throw new Error(`Review text length must be 1-${REVIEW_TEXT_MAX_LENGTH} characters`)
  }

  const supabase = createSupabaseAdminClient()

  // Rate-limit check: IP 또는 anonymousId 중 하나라도 윈도우 내 최근 작성이 있으면 차단.
  // IP가 비어있는 경우(로컬 dev 등)는 IP 검증 우회.
  const lastCreatedAt = await findLastReviewTime(supabase, input.cafeId, input.ip, input.anonymousId)
  const limit = checkReviewRateLimit({
    lastCreatedAt,
    windowHours: REVIEW_COOLDOWN_HOURS,
    now: new Date(),
  })

  if (!limit.allowed) {
    throw new CooldownError(limit.retryAfterSeconds)
  }

  const { data, error } = await supabase
    .from('cafe_reviews')
    .insert({
      cafe_id: input.cafeId,
      author_user_id: input.authorUserId,
      author_anonymous_id: input.anonymousId,
      author_nickname: input.nickname,
      author_animal: input.animal,
      ip: input.ip,
      text,
    })
    .select('id, cafe_id, author_user_id, author_anonymous_id, author_nickname, author_animal, text, report_count, created_at')
    .single()

  if (error) throw error

  return mapReviewRow(data as ReviewDbRow)
}

async function findLastReviewTime(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  cafeId: string,
  ip: string,
  anonymousId: string,
): Promise<Date | null> {
  // anonymousId는 항상 채워져 있으므로 OR 절로 두 조건을 함께 검사.
  // IP가 빈 문자열이면 IP 조건은 제외 (로컬 dev 호환).
  const orFilter = ip.length > 0
    ? `ip.eq.${escapeForOr(ip)},author_anonymous_id.eq.${escapeForOr(anonymousId)}`
    : `author_anonymous_id.eq.${escapeForOr(anonymousId)}`

  const { data, error } = await supabase
    .from('cafe_reviews')
    .select('created_at')
    .eq('cafe_id', cafeId)
    .or(orFilter)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error

  const row = data as { created_at: string } | null
  return row ? new Date(row.created_at) : null
}

// PostgREST .or() filter value escaping. 콤마/괄호 등을 안전하게 처리.
function escapeForOr(value: string): string {
  return value.replace(/[,()]/g, '_')
}

export async function updateReviewByUser(
  reviewId: string,
  text: string,
  anonymousId: string,
  userId: string | null,
): Promise<ReviewRecord | null> {
  const supabase = createSupabaseAdminClient()

  let query = supabase
    .from('cafe_reviews')
    .update({ text })
    .eq('id', reviewId)

  if (userId) {
    query = (query as typeof query).eq('author_user_id', userId)
  } else {
    query = (query as typeof query).eq('author_anonymous_id', anonymousId)
  }

  const { data, error } = await query
    .select('id, cafe_id, author_user_id, author_anonymous_id, author_nickname, author_animal, text, report_count, created_at')
    .maybeSingle()

  if (error) throw error
  return data ? mapReviewRow(data as ReviewDbRow) : null
}

export async function deleteReviewByUser(
  reviewId: string,
  anonymousId: string,
  userId: string | null,
): Promise<boolean> {
  const supabase = createSupabaseAdminClient()

  let query = supabase
    .from('cafe_reviews')
    .delete()
    .eq('id', reviewId)

  if (userId) {
    query = (query as typeof query).eq('author_user_id', userId)
  } else {
    query = (query as typeof query).eq('author_anonymous_id', anonymousId)
  }

  const { data, error } = await (query as typeof query).select('id')
  if (error) throw error
  return Array.isArray(data) && data.length > 0
}

export async function deleteReview(reviewId: string): Promise<void> {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('cafe_reviews')
    .delete()
    .eq('id', reviewId)

  if (error) throw error
}

export async function reportReview(reviewId: string, reporterAnonymousId: string): Promise<void> {
  const supabase = createSupabaseAdminClient()

  const { error: insertError, count } = await supabase
    .from('cafe_review_reports')
    .upsert(
      { review_id: reviewId, reporter_anonymous_id: reporterAnonymousId },
      { onConflict: 'review_id,reporter_anonymous_id', ignoreDuplicates: true, count: 'exact' },
    )

  if (insertError) throw insertError

  // 중복이면 count = 0, 새로 들어갔으면 count = 1. 새로 들어간 경우만 카운터 증가.
  if ((count ?? 0) > 0) {
    const { error: rpcError } = await supabase.rpc('increment_review_report_count', {
      p_review_id: reviewId,
    })
    if (rpcError) throw rpcError
  }
}

export interface AdminReviewRecord extends ReviewRecord {
  cafeId: string
}

export async function listAllReviewsForAdmin(limit: number = 200): Promise<AdminReviewRecord[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('cafe_reviews')
    .select('id, cafe_id, author_user_id, author_anonymous_id, author_nickname, author_animal, text, report_count, created_at')
    .order('report_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return ((data ?? []) as ReviewDbRow[]).map(mapReviewRow)
}

// ============================================================
// Summary (combined)
// ============================================================

export async function getFootprintSummary(
  cafeId: string,
  anonymousId: string | null,
): Promise<FootprintSummary> {
  const today = todayKstDateString()

  const [viewCount, visitData, reactions] = await Promise.all([
    getTodayViewCount(cafeId, today),
    getTodayVisitData(cafeId, anonymousId, today),
    getReactionSummary(cafeId, anonymousId),
  ])

  return {
    views: { today: viewCount },
    visits: { today: visitData.count, didIVisit: visitData.didIVisit },
    reactions,
  }
}
