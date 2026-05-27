import 'server-only'

import { randomUUID } from 'crypto'
import { createSupabaseAdminClient } from '../supabase'
import type { FootprintEmojiKey } from '../footprintEmojis'

// ── Views ──────────────────────────────────────────────────────────────────

export async function incrementViewRpc(cafeId: string, viewDate: string): Promise<void> {
  const { error } = await createSupabaseAdminClient().rpc('increment_cafe_view', {
    p_cafe_id: cafeId,
    p_view_date: viewDate,
  })
  if (error) throw error
}

export async function getTodayViewCount(cafeId: string, viewDate: string): Promise<number> {
  const { data, error } = await createSupabaseAdminClient()
    .from('cafe_view_daily')
    .select('count')
    .eq('cafe_id', cafeId)
    .eq('view_date', viewDate)
    .maybeSingle()
  if (error) throw error
  const row = data as { count: number } | null
  return row?.count ?? 0
}

// ── Visits ─────────────────────────────────────────────────────────────────

export async function upsertVisit(cafeId: string, anonymousId: string, visitDate: string): Promise<void> {
  const { error } = await createSupabaseAdminClient()
    .from('cafe_visits')
    .upsert(
      { cafe_id: cafeId, anonymous_id: anonymousId, visit_date: visitDate },
      { onConflict: 'cafe_id,anonymous_id,visit_date', ignoreDuplicates: true },
    )
  if (error) throw error
}

export async function getVisitsForDate(
  cafeId: string,
  visitDate: string,
): Promise<{ anonymous_id: string }[]> {
  const { data, error } = await createSupabaseAdminClient()
    .from('cafe_visits')
    .select('anonymous_id')
    .eq('cafe_id', cafeId)
    .eq('visit_date', visitDate)
  if (error) throw error
  return (data ?? []) as { anonymous_id: string }[]
}

// ── Reactions ──────────────────────────────────────────────────────────────

export async function getReactions(
  cafeId: string,
): Promise<{ emoji: FootprintEmojiKey; anonymous_id: string }[]> {
  const { data, error } = await createSupabaseAdminClient()
    .from('cafe_reactions')
    .select('emoji, anonymous_id')
    .eq('cafe_id', cafeId)
  if (error) throw error
  return (data ?? []) as { emoji: FootprintEmojiKey; anonymous_id: string }[]
}

export async function findReaction(
  cafeId: string,
  anonymousId: string,
  emoji: FootprintEmojiKey,
): Promise<boolean> {
  const { data, error } = await createSupabaseAdminClient()
    .from('cafe_reactions')
    .select('cafe_id')
    .eq('cafe_id', cafeId)
    .eq('anonymous_id', anonymousId)
    .eq('emoji', emoji)
    .maybeSingle()
  if (error) throw error
  return data !== null
}

export async function insertReactionRow(
  cafeId: string,
  anonymousId: string,
  emoji: FootprintEmojiKey,
): Promise<void> {
  const { error } = await createSupabaseAdminClient()
    .from('cafe_reactions')
    .insert({ cafe_id: cafeId, anonymous_id: anonymousId, emoji })
  if (error) throw error
}

export async function deleteReactionRow(
  cafeId: string,
  anonymousId: string,
  emoji: FootprintEmojiKey,
): Promise<void> {
  const { error } = await createSupabaseAdminClient()
    .from('cafe_reactions')
    .delete()
    .eq('cafe_id', cafeId)
    .eq('anonymous_id', anonymousId)
    .eq('emoji', emoji)
  if (error) throw error
}

export async function countReactions(cafeId: string, emoji: FootprintEmojiKey): Promise<number> {
  const { count, error } = await createSupabaseAdminClient()
    .from('cafe_reactions')
    .select('*', { count: 'exact', head: true })
    .eq('cafe_id', cafeId)
    .eq('emoji', emoji)
  if (error) throw error
  return count ?? 0
}

// ── Reviews ────────────────────────────────────────────────────────────────

export interface ReviewDbRow {
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

const REVIEW_SELECT =
  'id, cafe_id, author_user_id, author_anonymous_id, author_nickname, author_animal, text, report_count, created_at'

export async function getMyReviews(userId: string): Promise<ReviewDbRow[]> {
  const { data, error } = await createSupabaseAdminClient()
    .from('cafe_reviews')
    .select(REVIEW_SELECT)
    .eq('author_user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ReviewDbRow[]
}

export async function queryReviews(cafeId: string, limit: number): Promise<ReviewDbRow[]> {
  const { data, error } = await createSupabaseAdminClient()
    .from('cafe_reviews')
    .select(REVIEW_SELECT)
    .eq('cafe_id', cafeId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as ReviewDbRow[]
}

export async function queryAllReviews(limit: number): Promise<ReviewDbRow[]> {
  const { data, error } = await createSupabaseAdminClient()
    .from('cafe_reviews')
    .select(REVIEW_SELECT)
    .order('report_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as ReviewDbRow[]
}

export interface InsertReviewRow {
  cafe_id: string
  author_user_id: string | null
  author_anonymous_id: string
  author_nickname: string
  author_animal: string
  ip: string
  text: string
}

export async function insertReviewRow(row: InsertReviewRow): Promise<ReviewDbRow> {
  const { data, error } = await createSupabaseAdminClient()
    .from('cafe_reviews')
    .insert(row)
    .select(REVIEW_SELECT)
    .single()
  if (error) throw error
  return data as ReviewDbRow
}

export async function updateReviewRow(
  reviewId: string,
  text: string,
  userId: string | null,
  anonymousId: string,
): Promise<ReviewDbRow | null> {
  let query = createSupabaseAdminClient()
    .from('cafe_reviews')
    .update({ text })
    .eq('id', reviewId)

  if (userId) {
    query = (query as typeof query).eq('author_user_id', userId)
  } else {
    query = (query as typeof query).eq('author_anonymous_id', anonymousId)
  }

  const { data, error } = await query.select(REVIEW_SELECT).maybeSingle()
  if (error) throw error
  return data ? (data as ReviewDbRow) : null
}

export async function deleteReviewRow(
  reviewId: string,
  userId: string | null,
  anonymousId: string,
): Promise<boolean> {
  let query = createSupabaseAdminClient()
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

export async function deleteReviewByIdRow(reviewId: string): Promise<void> {
  const { error } = await createSupabaseAdminClient()
    .from('cafe_reviews')
    .delete()
    .eq('id', reviewId)
  if (error) throw error
}

export async function deleteReviewsByUser(userId: string): Promise<void> {
  const { error } = await createSupabaseAdminClient()
    .from('cafe_reviews')
    .delete()
    .eq('author_user_id', userId)

  if (error) throw error
}

export async function anonymizeReviewsByUser(userId: string): Promise<void> {
  const { error } = await createSupabaseAdminClient()
    .from('cafe_reviews')
    .update({
      author_user_id: null,
      author_anonymous_id: `withdrawn-${randomUUID()}`,
      author_nickname: '탈퇴한 사용자',
      author_animal: 'cat',
    })
    .eq('author_user_id', userId)

  if (error) throw error
}

export async function findLastReviewByIdentifiers(
  cafeId: string,
  ip: string,
  anonymousId: string,
): Promise<Date | null> {
  const orFilter = ip.length > 0
    ? `ip.eq.${escapeForOr(ip)},author_anonymous_id.eq.${escapeForOr(anonymousId)}`
    : `author_anonymous_id.eq.${escapeForOr(anonymousId)}`

  const { data, error } = await createSupabaseAdminClient()
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

export async function upsertReviewReport(
  reviewId: string,
  reporterAnonymousId: string,
): Promise<number> {
  const { error, count } = await createSupabaseAdminClient()
    .from('cafe_review_reports')
    .upsert(
      { review_id: reviewId, reporter_anonymous_id: reporterAnonymousId },
      { onConflict: 'review_id,reporter_anonymous_id', ignoreDuplicates: true, count: 'exact' },
    )
  if (error) throw error
  return count ?? 0
}

export async function incrementReviewReportCount(reviewId: string): Promise<void> {
  const { error } = await createSupabaseAdminClient().rpc('increment_review_report_count', {
    p_review_id: reviewId,
  })
  if (error) throw error
}

function escapeForOr(value: string): string {
  return value.replace(/[,()]/g, '_')
}
