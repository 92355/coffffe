'use client'

import type { Cafe } from '@/types/cafe'

interface CafeListItemProps {
  cafe: Cafe
  selected: boolean
  onSelect: (cafe: Cafe) => void
}

export default function CafeListItem({ cafe, selected, onSelect }: CafeListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(cafe)}
      className={`w-full rounded-2xl border p-4 text-left transition-all ${
        selected
          ? 'border-amber-500/70 bg-amber-50 shadow-md shadow-amber-900/10 dark:border-amber-400/60 dark:bg-amber-500/10'
          : 'border-neutral-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-amber-500/50 dark:hover:bg-neutral-800'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-neutral-950 dark:text-neutral-50">{cafe.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            {cafe.shortDescription}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
          {cafe.qualityScore.toFixed(1)}
        </span>
      </div>
      <p className="mt-3 truncate text-xs text-neutral-400 dark:text-neutral-500">{cafe.address}</p>
    </button>
  )
}
