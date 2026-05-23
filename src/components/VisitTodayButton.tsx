'use client'

import { Check, Footprints } from 'lucide-react'

interface VisitTodayButtonProps {
  visitedToday: boolean
  visitCount: number
  onMarkVisit: () => void
}

export default function VisitTodayButton({ visitedToday, visitCount, onMarkVisit }: VisitTodayButtonProps) {
  const disabled = visitedToday

  return (
    <button
      type="button"
      onClick={onMarkVisit}
      disabled={disabled}
      aria-pressed={visitedToday}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-black transition-colors ${
        visitedToday
          ? 'cursor-default bg-[#5a2e11] text-white shadow-[0_8px_20px_rgba(90,46,17,0.18)]'
          : 'bg-[#d66612] text-white shadow-[0_10px_24px_rgba(150,72,14,0.28)] hover:bg-[#c45b0d]'
      }`}
    >
      {visitedToday ? <Check size={16} /> : <Footprints size={16} />}
      <span>
        {visitedToday ? '오늘 다녀왔어요' : '오늘 다녀왔어요 누르기'}
      </span>
      <span className="ml-1 rounded-full bg-black/15 px-2 py-0.5 text-[11px] font-black">
        {visitCount}
      </span>
    </button>
  )
}
