'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchWithIdentity } from '@/lib/fetchWithIdentity'
import type { FootprintEmojiKey } from '@/lib/footprintEmojis'
import type { User } from '@/hooks/useUser'

export interface FootprintReactionEntry {
  emoji: FootprintEmojiKey
  count: number
  mine: boolean
}

export interface FootprintSummary {
  views: { today: number }
  visits: { today: number; didIVisit: boolean }
  reactions: FootprintReactionEntry[]
}

export interface ReviewEntry {
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

export interface CafeFootprintState {
  summary: FootprintSummary | null
  reviews: ReviewEntry[]
  loading: boolean
  error: string | null
  cooldownSeconds: number
  markVisit: () => Promise<void>
  toggleReaction: (emoji: FootprintEmojiKey) => Promise<void>
  submitReview: (text: string) => Promise<void>
  editReview: (reviewId: string, text: string) => Promise<void>
  deleteMyReview: (reviewId: string) => Promise<void>
  reportReview: (reviewId: string) => Promise<void>
}

interface FootprintResponse {
  views?: { today?: unknown }
  visits?: { today?: unknown; didIVisit?: unknown }
  reactions?: unknown
}

interface ReviewsResponse {
  reviews?: unknown
}

interface ReactionResponse {
  emoji?: unknown
  count?: unknown
  mine?: unknown
}

interface SubmitReviewResponse {
  review?: unknown
  error?: unknown
  retryAfterSeconds?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseReactions(value: unknown): FootprintReactionEntry[] {
  if (!Array.isArray(value)) return []
  return value
    .filter(isRecord)
    .map((row) => ({
      emoji: row.emoji as FootprintEmojiKey,
      count: typeof row.count === 'number' ? row.count : 0,
      mine: row.mine === true,
    }))
}

function parseSummary(value: unknown): FootprintSummary | null {
  if (!isRecord(value)) return null
  const raw = value as FootprintResponse
  const viewsToday = typeof raw.views?.today === 'number' ? raw.views.today : 0
  const visitsToday = typeof raw.visits?.today === 'number' ? raw.visits.today : 0
  const didIVisit = raw.visits?.didIVisit === true

  return {
    views: { today: viewsToday },
    visits: { today: visitsToday, didIVisit },
    reactions: parseReactions(raw.reactions),
  }
}

function parseReview(value: unknown): ReviewEntry | null {
  if (!isRecord(value)) return null
  const id = value.id
  const cafeId = value.cafeId
  const text = value.text
  const nickname = value.authorNickname
  const animal = value.authorAnimal
  const anonymousId = value.authorAnonymousId
  const createdAt = value.createdAt
  if (
    typeof id !== 'string' ||
    typeof cafeId !== 'string' ||
    typeof text !== 'string' ||
    typeof nickname !== 'string' ||
    typeof animal !== 'string' ||
    typeof anonymousId !== 'string' ||
    typeof createdAt !== 'string'
  ) return null

  return {
    id,
    cafeId,
    authorUserId: typeof value.authorUserId === 'string' ? value.authorUserId : null,
    authorAnonymousId: anonymousId,
    authorNickname: nickname,
    authorAnimal: animal,
    text,
    reportCount: typeof value.reportCount === 'number' ? value.reportCount : 0,
    createdAt,
  }
}

function parseReviews(value: unknown): ReviewEntry[] {
  if (!Array.isArray(value)) return []
  return value.map(parseReview).filter((entry): entry is ReviewEntry => entry !== null)
}

export function useCafeFootprint(
  cafeId: string | null | undefined,
  user: User | null,
  initialData?: FootprintSummary | null,
): CafeFootprintState {
  const [summary, setSummary] = useState<FootprintSummary | null>(initialData ?? null)
  const [reviews, setReviews] = useState<ReviewEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  useEffect(() => {
    if (!cafeId) return

    // Skip initial summary fetch when SSR-provided initialData is present.
    // Still fetch reviews (not included in SSR snapshot).
    const abortController = new AbortController()
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!initialData) setLoading(true)
    setError(null)
    /* eslint-enable react-hooks/set-state-in-effect */

    async function loadAll(currentCafeId: string): Promise<void> {
      try {
        const fetches = initialData
          ? [fetchWithIdentity(`/api/cafes/${encodeURIComponent(currentCafeId)}/reviews`, { signal: abortController.signal, cache: 'no-store' })]
          : [
              fetchWithIdentity(`/api/cafes/${encodeURIComponent(currentCafeId)}/footprint`, { signal: abortController.signal, cache: 'no-store' }),
              fetchWithIdentity(`/api/cafes/${encodeURIComponent(currentCafeId)}/reviews`, { signal: abortController.signal, cache: 'no-store' }),
            ]

        const results = await Promise.all(fetches)

        if (initialData) {
          const [reviewsRes] = results
          if (!reviewsRes?.ok) throw new Error('reviews load failed')
          const reviewsData = await reviewsRes.json() as ReviewsResponse
          if (abortController.signal.aborted) return
          setReviews(parseReviews(reviewsData.reviews))
        } else {
          const [summaryRes, reviewsRes] = results
          if (!summaryRes?.ok) throw new Error('summary load failed')
          if (!reviewsRes?.ok) throw new Error('reviews load failed')
          const summaryData = await summaryRes.json() as FootprintResponse
          const reviewsData = await reviewsRes.json() as ReviewsResponse
          if (abortController.signal.aborted) return
          setSummary(parseSummary(summaryData))
          setReviews(parseReviews(reviewsData.reviews))
        }
      } catch (loadError) {
        if (abortController.signal.aborted) return
        console.warn('Failed to load cafe footprint. / 카페 발자취 로드 실패.', loadError)
        setError('발자취를 불러오지 못했어요.')
      } finally {
        if (!abortController.signal.aborted) setLoading(false)
      }
    }

    void loadAll(cafeId)

    return () => {
      abortController.abort()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafeId])

  const markVisit = useCallback(async () => {
    if (!cafeId) return
    setError(null)

    setSummary((prev) => prev && !prev.visits.didIVisit
      ? { ...prev, visits: { today: prev.visits.today + 1, didIVisit: true } }
      : prev)

    try {
      const response = await fetchWithIdentity(`/api/cafes/${encodeURIComponent(cafeId)}/visits`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('visit failed')
    } catch (visitError) {
      console.warn('Failed to mark visit. / 다녀왔어요 저장 실패.', visitError)
      setError('다녀왔어요를 저장하지 못했어요.')
    }
  }, [cafeId])

  const toggleReaction = useCallback(async (emoji: FootprintEmojiKey) => {
    if (!cafeId) return
    setError(null)

    try {
      const response = await fetchWithIdentity(`/api/cafes/${encodeURIComponent(cafeId)}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      })
      if (!response.ok) throw new Error('reaction failed')

      const data = await response.json() as ReactionResponse
      if (typeof data.count !== 'number' || typeof data.emoji !== 'string') return

      setSummary((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          reactions: prev.reactions.map((entry) => entry.emoji === emoji
            ? { emoji: entry.emoji, count: data.count as number, mine: data.mine === true }
            : entry),
        }
      })
    } catch (reactionError) {
      console.warn('Failed to toggle reaction. / 반응 토글 실패.', reactionError)
      setError('반응을 저장하지 못했어요.')
    }
  }, [cafeId])

  const submitReview = useCallback(async (text: string) => {
    if (!cafeId) return
    setError(null)
    setCooldownSeconds(0)

    const body: Record<string, string> = { text }
    if (user?.type === 'anonymous') {
      body.nickname = user.nickname
      body.animal = user.animal
    } else if (user?.type === 'authenticated') {
      body.nickname = user.siteNickname
      body.animal = user.siteAnimal
    }

    try {
      const response = await fetchWithIdentity(`/api/cafes/${encodeURIComponent(cafeId)}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.status === 429) {
        const data = await response.json() as SubmitReviewResponse
        const retryAfter = typeof data.retryAfterSeconds === 'number' ? data.retryAfterSeconds : 0
        setCooldownSeconds(retryAfter)
        setError('아직 다른 한줄평을 남길 수 없어요. 잠시 후 다시 시도해 주세요.')
        return
      }

      if (!response.ok) throw new Error('review insert failed')

      const data = await response.json() as SubmitReviewResponse
      const newReview = parseReview(data.review)
      if (newReview) {
        setReviews((prev) => [newReview, ...prev])
      }
    } catch (submitError) {
      console.warn('Failed to submit review. / 한줄평 등록 실패.', submitError)
      setError('한줄평을 등록하지 못했어요.')
    }
  }, [cafeId, user])

  const editReview = useCallback(async (reviewId: string, text: string) => {
    if (!cafeId) return
    setError(null)

    try {
      const response = await fetchWithIdentity(
        `/api/cafes/${encodeURIComponent(cafeId)}/reviews/${encodeURIComponent(reviewId)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        },
      )
      if (!response.ok) throw new Error('edit failed')

      const data = await response.json() as { review?: unknown }
      const updated = parseReview(data.review)
      if (updated) {
        setReviews((prev) => prev.map((r) => r.id === reviewId ? updated : r))
      }
    } catch (editError) {
      console.warn('Failed to edit review. / 한줄평 수정 실패.', editError)
      setError('한줄평을 수정하지 못했어요.')
    }
  }, [cafeId])

  const deleteMyReview = useCallback(async (reviewId: string) => {
    if (!cafeId) return
    setError(null)

    try {
      const response = await fetchWithIdentity(
        `/api/cafes/${encodeURIComponent(cafeId)}/reviews/${encodeURIComponent(reviewId)}`,
        { method: 'DELETE' },
      )
      if (!response.ok) throw new Error('delete failed')

      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
    } catch (deleteError) {
      console.warn('Failed to delete review. / 한줄평 삭제 실패.', deleteError)
      setError('한줄평을 삭제하지 못했어요.')
    }
  }, [cafeId])

  const reportReviewAction = useCallback(async (reviewId: string) => {
    if (!cafeId) return
    setError(null)

    try {
      const response = await fetchWithIdentity(
        `/api/cafes/${encodeURIComponent(cafeId)}/reviews/${encodeURIComponent(reviewId)}/report`,
        { method: 'POST' },
      )
      if (!response.ok) throw new Error('report failed')
    } catch (reportError) {
      console.warn('Failed to report review. / 한줄평 신고 실패.', reportError)
      setError('신고를 처리하지 못했어요.')
    }
  }, [cafeId])

  return {
    summary,
    reviews,
    loading,
    error,
    cooldownSeconds,
    markVisit,
    toggleReaction,
    submitReview,
    editReview,
    deleteMyReview,
    reportReview: reportReviewAction,
  }
}
