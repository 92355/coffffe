'use client'

import { useState } from 'react'
import { useUser } from '@/hooks/useUser'
import { useCafeFootprint } from '@/hooks/useCafeFootprint'
import VisitTodayButton from './VisitTodayButton'
import ReactionRow from './ReactionRow'
import ReviewForm from './ReviewForm'
import ReviewList from './ReviewList'

interface CafeFootprintPanelProps {
  cafeId: string
}

export default function CafeFootprintPanel({ cafeId }: CafeFootprintPanelProps) {
  const { user } = useUser()
  const {
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
    reportReview,
  } = useCafeFootprint(cafeId, user)
  const [reportFeedback, setReportFeedback] = useState<string | null>(null)

  async function handleReport(reviewId: string): Promise<void> {
    await reportReview(reviewId)
    setReportFeedback('신고가 접수됐어요. 검토 후 처리됩니다.')
    window.setTimeout(() => setReportFeedback(null), 3000)
  }

  return (
    <section className="space-y-5 rounded-3xl border border-[#eadccb] bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <header className="space-y-1">
        <h2 className="text-base font-black text-[#3f2618] dark:text-white">발자취</h2>
        <p className="text-xs font-bold text-[#a08770] dark:text-white/50">
          오늘 둘러본 사람 {summary?.views.today ?? 0}명 · 다녀온 사람 {summary?.visits.today ?? 0}명
        </p>
      </header>

      <VisitTodayButton
        visitedToday={summary?.visits.didIVisit ?? false}
        visitCount={summary?.visits.today ?? 0}
        onMarkVisit={() => void markVisit()}
      />

      <div className="space-y-2">
        <h3 className="text-xs font-black text-[#5a2e11] dark:text-white/75">반응 남기기</h3>
        <ReactionRow reactions={summary?.reactions ?? []} onToggle={(emoji) => void toggleReaction(emoji)} />
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-black text-[#5a2e11] dark:text-white/75">한줄평</h3>
        <ReviewForm cooldownSeconds={cooldownSeconds} onSubmit={submitReview} />
      </div>

      {reportFeedback && (
        <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">{reportFeedback}</p>
      )}
      {error && (
        <p className="text-[11px] font-bold text-red-700 dark:text-red-300">{error}</p>
      )}

      <div className="space-y-2">
        {loading && reviews.length === 0 ? (
          <div className="h-20 animate-pulse rounded-2xl bg-[#f4ece2] dark:bg-white/5" />
        ) : (
          <ReviewList
            reviews={reviews}
            user={user}
            onReport={(reviewId) => void handleReport(reviewId)}
            onEdit={editReview}
            onDelete={deleteMyReview}
          />
        )}
      </div>
    </section>
  )
}
