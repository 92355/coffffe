'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import { useUser } from '@/hooks/useUser'
import {
  type Axis,
  type Scores,
  CBTI_QUESTIONS as QUESTIONS,
  CBTI_RESULTS as RESULTS,
  CBTI_INIT_SCORES as INIT_SCORES,
  calculateCbtiResult,
} from '@/lib/cbti'

type Phase = 'intro' | 'quiz' | 'result'

// ─── Component ────────────────────────────────────────────────────────────────

export default function CbtiPage() {
  const { user } = useUser()
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [scores, setScores] = useState<Scores>(INIT_SCORES)
  const [history, setHistory] = useState<Axis[]>([])
  const [result, setResult] = useState<string | null>(null)
  const [selected, setSelected] = useState<0 | 1 | null>(null)
  const lastSavedResultRef = useRef<string | null>(null)

  useEffect(() => {
    if (user?.type !== 'authenticated' || phase !== 'result' || !result || result === lastSavedResultRef.current) return

    let cancelled = false

    async function saveCbtiResult(): Promise<void> {
      try {
        const response = await fetch('/api/me/cbti', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cbtiType: result }),
        })
        if (!response.ok) return
        if (cancelled) return

        lastSavedResultRef.current = result
      } catch (error) {
        console.warn('Failed to save CBTI profile. / CBTI 프로필 저장 실패.', error)
      }
    }

    void saveCbtiResult()

    return () => {
      cancelled = true
    }
  }, [phase, result, user])

  function handleChoice(axis: Axis, idx: 0 | 1) {
    if (selected !== null) return
    setSelected(idx)
    setTimeout(() => {
      const next = { ...scores, [axis]: scores[axis] + 1 }
      setScores(next)
      setHistory(h => [...h, axis])
      setSelected(null)
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ((q) => q + 1)
      } else {
        setResult(calculateCbtiResult([...history, axis]))
        setPhase('result')
      }
    }, 320)
  }

  function goBack() {
    if (currentQ === 0 || selected !== null) return
    const prevAxis = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    setScores(s => ({ ...s, [prevAxis]: s[prevAxis] - 1 }))
    setCurrentQ(q => q - 1)
  }

  function restart() {
    setPhase('intro')
    setCurrentQ(0)
    setScores(INIT_SCORES)
    setHistory([])
    setResult(null)
    setSelected(null)
  }

  const progress = (currentQ / QUESTIONS.length) * 100

  return (
    <div className="relative flex flex-col min-h-dvh overflow-x-hidden">

      {/* Background blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-[var(--sub)]/15 blur-3xl dark:opacity-25"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-32 -left-32 h-96 w-96 rounded-full bg-[var(--accent)]/12 blur-3xl dark:opacity-20"
      />

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/70 bg-white/58 backdrop-blur-2xl shadow-[0_8px_24px_rgba(107,67,42,0.08)] dark:bg-gray-900/80 dark:border-white/10 shrink-0">
        <div className="max-w-lg mx-auto flex items-center gap-3 h-14 px-4">
          <Link
            href="/home"
            className="w-8 h-8 flex items-center justify-center rounded-full no-underline"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="홈으로"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </Link>
          <span className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
            커피 CBTI
          </span>
          <div className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/50 shadow-[0_8px_22px_rgba(107,67,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Intro ── */}
      {phase === 'intro' && (
        <div className="flex flex-col items-center justify-center flex-1 px-6 py-10 text-center">
          <div className="text-7xl mb-6 anim-in" style={{ animationDelay: '0ms' }}>☕</div>
          <h1
            className="text-3xl font-black mb-3 anim-in"
            style={{ color: 'var(--foreground)', animationDelay: '80ms' }}
          >
            커피 CBTI
          </h1>
          <p
            className="mb-1 anim-in text-sm"
            style={{ color: 'var(--text-secondary)', animationDelay: '140ms' }}
          >
            10가지 질문으로 알아보는
          </p>
          <p
            className="mb-10 anim-in text-sm"
            style={{ color: 'var(--text-secondary)', animationDelay: '180ms' }}
          >
            나의 커피 성격 유형
          </p>
          <button
            onClick={() => setPhase('quiz')}
            className="anim-in text-white font-black px-10 py-3.5 rounded-2xl active:scale-95 transition-all duration-200 text-base shadow-[0_12px_28px_rgba(192,138,90,0.35)]"
            style={{ background: 'var(--sub)', animationDelay: '260ms' }}
          >
            시작하기 →
          </button>
          <p
            className="mt-4 text-xs anim-in"
            style={{ color: 'var(--text-secondary)', animationDelay: '320ms' }}
          >
            16가지 커피 유형 중 나는?
          </p>
        </div>
      )}

      {/* ── Quiz ── */}
      {phase === 'quiz' && (
        <div className="flex flex-col flex-1 px-4 pt-5 pb-8 max-w-lg mx-auto w-full">
          {/* Progress + counter */}
          <div className="rounded-2xl border border-white/70 bg-white/42 px-4 py-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(107,67,42,0.08)] dark:bg-gray-900/40 dark:border-white/8 mb-5 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black" style={{ color: 'var(--text-secondary)' }}>진행</span>
              <span className="text-xs font-black" style={{ color: 'var(--sub)' }}>{currentQ + 1} / {QUESTIONS.length}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(107,67,42,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%`, background: 'var(--sub)' }}
              />
            </div>
          </div>

          {/* Question — key forces remount → triggers .anim-in */}
          <div key={currentQ} className="anim-in flex flex-col flex-1">

            <div className="rounded-2xl border border-white/70 bg-white/42 px-5 py-6 backdrop-blur-xl shadow-[0_8px_24px_rgba(107,67,42,0.08)] dark:bg-gray-900/40 dark:border-white/8 text-center mb-5">
              <div className="text-5xl mb-4">{QUESTIONS[currentQ].emoji}</div>
              <h2 className="text-lg font-black leading-snug" style={{ color: 'var(--foreground)' }}>
                {QUESTIONS[currentQ].text}
              </h2>
            </div>

            {/* Choices */}
            <div className="flex flex-col gap-3">
              {QUESTIONS[currentQ].choices.map((choice, idx) => {
                const isSelected = selected === idx
                const isOther = selected !== null && selected !== idx
                return (
                  <button
                    key={idx}
                    onClick={() => handleChoice(choice.axis, idx as 0 | 1)}
                    disabled={selected !== null}
                    className={[
                      'rounded-2xl p-5 text-left border transition-all duration-200 backdrop-blur-xl',
                      isSelected
                        ? 'scale-[0.98] shadow-[0_12px_28px_rgba(192,138,90,0.22)]'
                        : isOther
                          ? 'opacity-30 scale-[0.97]'
                          : 'border-white/70 bg-white/42 dark:bg-gray-900/40 dark:border-white/8 hover:bg-white/60 dark:hover:bg-white/10 active:scale-[0.98] shadow-[0_8px_24px_rgba(107,67,42,0.08)]',
                    ].join(' ')}
                    style={isSelected ? {
                      background: `color-mix(in srgb, var(--sub) 12%, rgba(255,255,255,0.72))`,
                      border: `1.5px solid color-mix(in srgb, var(--sub) 40%, rgba(255,255,255,0.6))`,
                    } : undefined}
                  >
                    <div className="font-black mb-1 text-[15px]" style={{ color: 'var(--foreground)' }}>
                      {choice.label}
                    </div>
                    <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {choice.detail}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Back button */}
            {currentQ > 0 && (
              <button
                onClick={goBack}
                disabled={selected !== null}
                className="mt-5 mx-auto flex items-center gap-1 text-xs font-bold transition-colors disabled:opacity-30"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ArrowLeft size={13} strokeWidth={2.5} />
                이전 질문으로
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {phase === 'result' && result && RESULTS[result] && (
        <div className="flex flex-col flex-1 px-4 py-8">
          <div className="anim-in w-full max-w-lg mx-auto">
            {/* Type header */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{RESULTS[result].emoji}</div>
              <div className="text-xs font-black tracking-[0.3em] mb-2" style={{ color: 'var(--sub)' }}>
                {result}
              </div>
              <h2 className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>
                {RESULTS[result].name}
              </h2>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-white/70 bg-white/42 p-5 backdrop-blur-xl shadow-[0_8px_24px_rgba(107,67,42,0.08)] dark:bg-gray-900/40 dark:border-white/8 mb-4">
              <p className="text-sm leading-[1.8]" style={{ color: 'var(--foreground)', opacity: 0.85 }}>
                {RESULTS[result].desc}
              </p>
            </div>

            {/* Traits */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {RESULTS[result].traits.map((t) => (
                <span
                  key={t}
                  className="text-xs rounded-full border border-white/70 bg-white/60 px-3.5 py-1.5 font-black backdrop-blur-xl dark:bg-white/10 dark:border-white/10"
                  style={{ color: 'var(--sub)' }}
                >
                  # {t}
                </span>
              ))}
            </div>

            {/* Recommend & Pairing */}
            <div className="rounded-2xl border border-white/70 bg-white/42 backdrop-blur-xl shadow-[0_8px_24px_rgba(107,67,42,0.08)] dark:bg-gray-900/40 dark:border-white/8 overflow-hidden mb-4">
              <div className="px-4 py-3.5 border-b border-white/50 dark:border-white/8">
                <p className="text-xs font-black mb-1" style={{ color: 'var(--sub)' }}>추천 한 잔</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{RESULTS[result].recommend}</p>
              </div>
              <div className="px-4 py-3.5 border-b border-white/50 dark:border-white/8">
                <p className="text-xs font-black mb-2" style={{ color: 'var(--sub)' }}>어울리는 향미</p>
                <div className="flex flex-wrap gap-1.5">
                  {RESULTS[result].pairingNotes.map((note) => (
                    <span
                      key={note}
                      className="text-xs rounded-full border border-[rgba(107,67,42,0.16)] bg-[rgba(255,255,255,0.76)] px-2.5 py-1 font-bold shadow-[0_4px_12px_rgba(107,67,42,0.07)] dark:border-white/12 dark:bg-white/10"
                      style={{ color: 'var(--accent)' }}
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-4 py-3.5">
                <p className="text-xs font-black mb-1" style={{ color: 'var(--sub)' }}>어울리는 카페 스타일</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{RESULTS[result].cafeStyle}</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3">
              <button
                onClick={restart}
                className="flex-1 py-3.5 rounded-2xl border border-white/70 bg-white/42 backdrop-blur-xl text-sm font-black transition-colors dark:border-white/10 dark:bg-white/8"
                style={{ color: 'var(--foreground)' }}
              >
                다시 하기
              </button>
              <Link
                href="/map"
                className="flex-1 py-3.5 rounded-2xl text-white text-sm font-black text-center transition-colors shadow-[0_12px_28px_rgba(192,138,90,0.35)]"
                style={{ background: 'var(--sub)', textDecoration: 'none' }}
              >
                카페 찾아보기 📍
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
