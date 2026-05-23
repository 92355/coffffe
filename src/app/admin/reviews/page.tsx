'use client'

import { startTransition, useEffect, useState } from 'react'
import { Flag, MessageCircle, Trash2 } from 'lucide-react'

interface ReviewRecord {
  id: string
  cafeId: string
  authorNickname: string
  authorAnimal: string
  text: string
  reportCount: number
  createdAt: string
}

interface ReviewsResponse {
  reviews?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseReviews(value: unknown): ReviewRecord[] {
  if (!Array.isArray(value)) return []
  return value
    .filter(isRecord)
    .map((row) => ({
      id: typeof row.id === 'string' ? row.id : '',
      cafeId: typeof row.cafeId === 'string' ? row.cafeId : '',
      authorNickname: typeof row.authorNickname === 'string' ? row.authorNickname : '익명',
      authorAnimal: typeof row.authorAnimal === 'string' ? row.authorAnimal : '',
      text: typeof row.text === 'string' ? row.text : '',
      reportCount: typeof row.reportCount === 'number' ? row.reportCount : 0,
      createdAt: typeof row.createdAt === 'string' ? row.createdAt : '',
    }))
    .filter((entry) => entry.id.length > 0)
}

async function readApiErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json() as { error?: unknown }
    return typeof body.error === 'string' ? body.error : `Request failed: ${response.status}`
  } catch {
    return `Request failed: ${response.status}`
  }
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
}

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<ReviewRecord[]>([])
  const [message, setMessage] = useState('')

  const reportedCount = reviews.filter((review) => review.reportCount > 0).length

  async function loadReviews(): Promise<void> {
    const response = await fetch('/api/admin/reviews', {
      cache: 'no-store',
      credentials: 'same-origin',
    })
    if (!response.ok) throw new Error(await readApiErrorMessage(response))
    const data = await response.json() as ReviewsResponse
    setReviews(parseReviews(data.reviews))
  }

  useEffect(() => {
    startTransition(() => {
      void loadReviews().catch((error) => {
        console.error(error)
        setMessage('한줄평 목록을 불러오지 못했습니다.')
      })
    })
  }, [])

  async function deleteReview(reviewId: string): Promise<void> {
    if (!window.confirm('이 한줄평을 삭제하시겠습니까? 되돌릴 수 없습니다.')) return

    setMessage('한줄평을 삭제하는 중입니다.')
    const response = await fetch(`/api/admin/reviews/${encodeURIComponent(reviewId)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    })

    if (!response.ok) {
      setMessage(`삭제 실패: ${await readApiErrorMessage(response)}`)
      return
    }

    await loadReviews()
    setMessage('삭제했습니다.')
  }

  return (
    <div className="px-5 py-6">
      <div className="mb-6 flex items-center gap-3">
        <MessageCircle size={20} className="text-[#5a2e11]" />
        <h1 className="text-xl font-black text-[#3f2618]">한줄평 관리</h1>
        {reportedCount > 0 && (
          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
            신고 {reportedCount}
          </span>
        )}
      </div>

      {message && <p className="mb-4 text-sm font-bold text-[#8b5a32]">{message}</p>}

      <div className="max-w-2xl space-y-3">
        {reviews.length === 0 && (
          <p className="rounded-md border border-dashed border-[#d8c8b8] px-3 py-6 text-center text-sm font-bold text-[#7a6654]">
            한줄평이 없습니다.
          </p>
        )}

        {reviews.map((review) => (
          <article
            key={review.id}
            className={`rounded-lg border bg-white p-4 shadow-sm ${
              review.reportCount > 0 ? 'border-red-200' : 'border-[#eadfd3]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-black text-[#3f2618]">{review.authorNickname}</h3>
                  {review.reportCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-black text-red-700">
                      <Flag size={11} />신고 {review.reportCount}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs font-semibold text-[#7a6654]">
                  {review.cafeId} · {formatDateTime(review.createdAt)}
                </p>
                <p className="mt-2 break-words text-sm font-bold text-[#3f2618]">{review.text}</p>
              </div>
              <button
                type="button"
                onClick={() => void deleteReview(review.id)}
                className="flex h-9 items-center gap-1 rounded-md border border-neutral-300 bg-white px-3 text-xs font-black text-neutral-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 size={14} />삭제
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
