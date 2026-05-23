'use client'

import { FOOTPRINT_EMOJIS, type FootprintEmojiKey } from '@/lib/footprintEmojis'
import type { FootprintReactionEntry } from '@/hooks/useCafeFootprint'

interface ReactionRowProps {
  reactions: FootprintReactionEntry[]
  onToggle: (emoji: FootprintEmojiKey) => void
}

function findReaction(reactions: FootprintReactionEntry[], key: FootprintEmojiKey): FootprintReactionEntry {
  return reactions.find((entry) => entry.emoji === key)
    ?? { emoji: key, count: 0, mine: false }
}

export default function ReactionRow({ reactions, onToggle }: ReactionRowProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {FOOTPRINT_EMOJIS.map((meta) => {
        const reaction = findReaction(reactions, meta.key)
        return (
          <button
            key={meta.key}
            type="button"
            onClick={() => onToggle(meta.key)}
            aria-pressed={reaction.mine}
            aria-label={meta.ariaLabel}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-2xl border px-1 py-2 text-center transition-colors ${
              reaction.mine
                ? 'border-[#d66612] bg-[#fff3e6] text-[#5a2e11] shadow-[0_4px_14px_rgba(150,72,14,0.18)] dark:bg-[#3a2010] dark:text-[#fff1e3]'
                : 'border-[#eadccb] bg-white text-[#5a2e11] hover:bg-[#fff9f1] dark:border-white/15 dark:bg-white/5 dark:text-white/80'
            }`}
          >
            <span className="text-xl leading-none" aria-hidden>{meta.glyph}</span>
            <span className="text-[10px] font-bold leading-tight">{meta.label}</span>
            <span className="text-[11px] font-black">{reaction.count}</span>
          </button>
        )
      })}
    </div>
  )
}
