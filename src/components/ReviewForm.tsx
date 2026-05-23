'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

const TEXT_MAX_LENGTH = 50

interface ReviewFormProps {
  cooldownSeconds: number
  onSubmit: (text: string) => Promise<void>
}

function formatCooldown(seconds: number): string {
  if (seconds < 60) return `${seconds}초 후 다시 작성 가능`
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}분 후 다시 작성 가능`
  return `${Math.ceil(seconds / 3600)}시간 후 다시 작성 가능`
}

export default function ReviewForm({ cooldownSeconds, onSubmit }: ReviewFormProps) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const cooling = cooldownSeconds > 0
  const trimmed = text.trim()
  const disabled = submitting || cooling || trimmed.length === 0

  async function handleSubmit(): Promise<void> {
    if (disabled) return

    setSubmitting(true)
    try {
      await onSubmit(trimmed)
      setText('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="rounded-2xl border border-[#eadccb] bg-white p-3 dark:border-white/15 dark:bg-white/5">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value.slice(0, TEXT_MAX_LENGTH))}
          rows={2}
          maxLength={TEXT_MAX_LENGTH}
          placeholder={cooling ? formatCooldown(cooldownSeconds) : '50자 한줄평을 남겨주세요'}
          disabled={cooling}
          className="w-full resize-none bg-transparent text-sm font-bold text-[#3f2618] placeholder:text-[#a08770] focus:outline-none dark:text-white dark:placeholder:text-white/40"
        />
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#a08770] dark:text-white/45">
            {text.length}/{TEXT_MAX_LENGTH}
          </span>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={disabled}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-[#d66612] px-3 text-xs font-black text-white shadow-sm transition-colors hover:bg-[#c45b0d] disabled:cursor-not-allowed disabled:bg-[#cdb89e] disabled:text-white/85 disabled:shadow-none"
          >
            <Send size={13} />
            {submitting ? '등록 중…' : '한줄평 남기기'}
          </button>
        </div>
      </div>
      {cooling && (
        <p className="text-[11px] font-bold text-[#8b5a32] dark:text-amber-300">
          {formatCooldown(cooldownSeconds)}
        </p>
      )}
    </div>
  )
}
