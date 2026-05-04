'use client'

import Link from 'next/link'
import type { Cafe } from '@/types/cafe'
import { ROAST_LABELS, ORIGIN_LABELS, BREW_LABELS } from '@/types/cafe'

interface CafePreviewCardProps {
  cafe: Cafe | null
  onClose: () => void
}

export default function CafePreviewCard({ cafe, onClose }: CafePreviewCardProps) {
  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-10 transition-transform duration-300 ease-out ${
        cafe ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.10)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)] border-t border-gray-100 dark:border-gray-800">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm"
          aria-label="닫기"
        >
          ✕
        </button>

        {cafe && (
          <div className="px-5 pt-1 pb-6" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{cafe.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 mb-3">{cafe.shortDescription}</p>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {cafe.roastLevels.map(r => (
                <span key={r} className="rounded-full bg-amber-50 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-400">
                  {ROAST_LABELS[r]}
                </span>
              ))}
              {cafe.beanOrigins.map(o => (
                <span key={o} className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                  {ORIGIN_LABELS[o]}
                </span>
              ))}
              {cafe.brewMethods.map(m => (
                <span key={m} className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                  {BREW_LABELS[m]}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} className={`h-2 w-2 rounded-full ${
                      i <= Math.round(cafe.qualityScore) ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{cafe.qualityScore.toFixed(1)}</span>
              </div>
              <Link
                href={`/cafes/${cafe.id}`}
                className="rounded-full bg-gray-900 dark:bg-gray-100 px-5 py-2.5 text-sm font-medium text-white dark:text-gray-900 active:opacity-80 transition-opacity"
              >
                자세히 보기
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
