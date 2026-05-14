'use client'

import Link from 'next/link'
import type { Cafe } from '@/types/cafe'
import { ROAST_LABELS, ORIGIN_LABELS, BREW_LABELS } from '@/types/cafe'

interface CafePreviewCardProps {
  cafe: Cafe | null
  compact?: boolean
}

export default function CafePreviewCard({ cafe, compact = false }: CafePreviewCardProps) {
  if (!cafe) return null

  return (
    <article>
      <h2 className={`${compact ? 'text-lg' : 'text-xl'} font-black text-neutral-950 dark:text-neutral-50`}>
        {cafe.name}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{cafe.shortDescription}</p>
      {!compact && (
        <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{cafe.fullDescription}</p>
      )}

      <div className="my-4 flex flex-wrap gap-1.5">
        {cafe.roastLevels.map(r => (
          <span key={r} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            {ROAST_LABELS[r]}
          </span>
        ))}
        {cafe.beanOrigins.map(o => (
          <span key={o} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {ORIGIN_LABELS[o]}
          </span>
        ))}
        {cafe.brewMethods.map(m => (
          <span key={m} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            {BREW_LABELS[m]}
          </span>
        ))}
      </div>

      <div className="mb-4 space-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
        <p className="truncate">{cafe.address}</p>
        <p>영업: {cafe.openHours}</p>
        <p>휴무: {cafe.closedDays.length > 0 ? cafe.closedDays.join(', ') : '정보 없음'}</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} className={`h-2 w-2 rounded-full ${
                i <= Math.round(cafe.qualityScore) ? 'bg-amber-500' : 'bg-neutral-200 dark:bg-neutral-700'
              }`} />
            ))}
          </div>
          <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200">{cafe.qualityScore.toFixed(1)}</span>
        </div>
        <Link
          href={`/cafes/${cafe.id}`}
          className="shrink-0 rounded-full bg-neutral-950 px-4 py-2 text-sm font-bold text-white no-underline transition-opacity active:opacity-80 dark:bg-neutral-100 dark:text-neutral-950"
        >
          자세히 보기
        </Link>
      </div>
    </article>
  )
}
