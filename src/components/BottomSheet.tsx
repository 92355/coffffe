'use client'

import { X } from 'lucide-react'
import type { Cafe } from '@/types/cafe'
import CafePreviewCard from '@/components/CafePreviewCard'

interface BottomSheetProps {
  cafe: Cafe | null
  onClose: () => void
  favorite?: boolean
  onFavoriteToggle?: (cafeId: string) => void
}

export default function BottomSheet({
  cafe,
  onClose,
  favorite = false,
  onFavoriteToggle,
}: BottomSheetProps) {
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-30 md:hidden transition-transform duration-300 ease-out ${
        cafe ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="pointer-events-auto rounded-t-3xl border-t border-white/20 bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.22)] dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300"
          aria-label="닫기"
        >
          <X size={16} />
        </button>
        <div className="px-5 pb-6 pt-3" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
          <CafePreviewCard
            cafe={cafe}
            compact
            favorite={favorite}
            onFavoriteToggle={onFavoriteToggle}
          />
        </div>
      </div>
    </div>
  )
}
