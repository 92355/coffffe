'use client'

import { useState } from 'react'
import { Check, Flag, Pencil, Trash2, X } from 'lucide-react'
import { getAnimalAvatarPath } from '@/lib/animalAvatar'
import { isNicknameAnimal } from '@/lib/nickname'
import type { ReviewEntry } from '@/hooks/useCafeFootprint'
import type { User } from '@/hooks/useUser'

const TEXT_MAX_LENGTH = 50

interface ReviewListProps {
  reviews: ReviewEntry[]
  user: User | null
  onReport: (reviewId: string) => void
  onEdit: (reviewId: string, text: string) => Promise<void>
  onDelete: (reviewId: string) => Promise<void>
}

function formatRelativeTime(isoString: string): string {
  const created = new Date(isoString).getTime()
  if (Number.isNaN(created)) return ''

  const diffSeconds = Math.floor((Date.now() - created) / 1000)
  if (diffSeconds < 60) return '방금'
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}분 전`
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}시간 전`
  return `${Math.floor(diffSeconds / 86400)}일 전`
}

function avatarPathFor(animal: string): string | null {
  return isNicknameAnimal(animal) ? getAnimalAvatarPath(animal) : null
}

function isMine(review: ReviewEntry, user: User | null): boolean {
  if (!user) return false
  if (user.type === 'anonymous') return review.authorAnonymousId === user.anonymousId
  return review.authorUserId === user.id
}

export default function ReviewList({ reviews, user, onReport, onEdit, onDelete }: ReviewListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [saving, setSaving] = useState(false)

  function startEdit(review: ReviewEntry) {
    setEditingId(review.id)
    setEditText(review.text)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditText('')
  }

  async function saveEdit(reviewId: string) {
    const trimmed = editText.trim()
    if (!trimmed || trimmed.length > TEXT_MAX_LENGTH) return
    setSaving(true)
    try {
      await onEdit(reviewId, trimmed)
      setEditingId(null)
    } finally {
      setSaving(false)
    }
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#eadccb] px-4 py-8 text-center text-sm font-bold text-[#a08770] dark:border-white/15 dark:text-white/50">
        아직 한줄평이 없어요. 첫 한줄평을 남겨보세요!
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {reviews.map((review) => {
        const avatar = avatarPathFor(review.authorAnimal)
        const mine = isMine(review, user)
        const editing = editingId === review.id

        return (
          <li
            key={review.id}
            className="rounded-2xl border border-[#eadccb] bg-white p-3 dark:border-white/15 dark:bg-white/5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f2d8c1] text-base">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    '☕'
                  )}
                </span>
                <p className="min-w-0 truncate text-xs font-black text-[#3f2618] dark:text-white">
                  {review.authorNickname}
                </p>
                <span className="text-[11px] font-bold text-[#a08770] dark:text-white/45">
                  {formatRelativeTime(review.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {mine ? (
                  <>
                    {!editing && (
                      <button
                        type="button"
                        onClick={() => startEdit(review)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[#a08770] hover:bg-[#f0f0f0] hover:text-[#5a2e11] dark:text-white/40 dark:hover:bg-white/10"
                        aria-label="수정"
                        title="수정"
                      >
                        <Pencil size={12} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void onDelete(review.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[#a08770] hover:bg-red-50 hover:text-red-600 dark:text-white/40 dark:hover:bg-white/10"
                      aria-label="삭제"
                      title="삭제"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => onReport(review.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[#a08770] hover:bg-[#fff3e6] hover:text-[#8b5a32] dark:text-white/40 dark:hover:bg-white/10"
                    aria-label="한줄평 신고"
                    title="신고"
                  >
                    <Flag size={12} />
                  </button>
                )}
              </div>
            </div>

            {editing ? (
              <div className="mt-2 space-y-1.5">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value.slice(0, TEXT_MAX_LENGTH))}
                  rows={2}
                  maxLength={TEXT_MAX_LENGTH}
                  autoFocus
                  className="w-full resize-none rounded-xl border border-[#d8c8b8] bg-white px-2.5 py-1.5 text-sm font-bold text-[#3f2618] outline-none focus:border-[#d66612] dark:border-white/20 dark:bg-white/10 dark:text-white"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#a08770]">{editText.length}/{TEXT_MAX_LENGTH}</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex h-7 items-center gap-1 rounded-lg border border-[#eadfd3] px-2.5 text-[11px] font-black text-[#7a6654]"
                    >
                      <X size={10} />취소
                    </button>
                    <button
                      type="button"
                      onClick={() => void saveEdit(review.id)}
                      disabled={saving || editText.trim().length === 0}
                      className="flex h-7 items-center gap-1 rounded-lg bg-[#d66612] px-2.5 text-[11px] font-black text-white disabled:opacity-50"
                    >
                      <Check size={10} />{saving ? '저장 중…' : '저장'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-2 break-words text-sm font-bold leading-snug text-[#3f2618] dark:text-white/90">
                {review.text}
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}
