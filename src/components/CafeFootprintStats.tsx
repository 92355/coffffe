'use client'

import { Footprints } from 'lucide-react'
import type { FootprintReactionEntry, FootprintSummary } from '@/hooks/useCafeFootprint'
import { FOOTPRINT_EMOJIS, type FootprintEmojiKey } from '@/lib/footprintEmojis'

interface CafeFootprintStatsProps {
  summary: FootprintSummary | null
  loading: boolean
}

function findReaction(
  reactions: FootprintReactionEntry[],
  key: FootprintEmojiKey,
): FootprintReactionEntry {
  return reactions.find((entry) => entry.emoji === key)
    ?? { emoji: key, count: 0, mine: false }
}

export default function CafeFootprintStats({ summary, loading }: CafeFootprintStatsProps) {
  if (loading && !summary) {
    return (
      <div className="flex h-6 items-center px-4 pt-3">
        <div className="h-3 w-44 animate-pulse rounded bg-[#e4d6c4] dark:bg-white/10" />
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 pt-3 text-[11px] font-bold text-[#7d6149] dark:text-white/65">
      <span className="inline-flex items-center gap-1">
        <span className="text-[#a07b5b] dark:text-white/55">오늘</span>
        <span aria-label="조회수">👀 {summary.views.today}</span>
      </span>
      <span aria-hidden className="text-[#cdb89e] dark:text-white/30">·</span>
      <span className="inline-flex items-center gap-1">
        <Footprints size={11} aria-hidden />
        다녀옴 {summary.visits.today}
      </span>
      {FOOTPRINT_EMOJIS.map((meta) => {
        const reaction = findReaction(summary.reactions, meta.key)
        return (
          <span key={meta.key} className="inline-flex items-center gap-0.5" aria-label={`${meta.ariaLabel} ${reaction.count}명`}>
            <span aria-hidden>·</span>
            <span aria-hidden>{meta.glyph}</span>
            <span>{reaction.count}</span>
          </span>
        )
      })}
    </div>
  )
}
