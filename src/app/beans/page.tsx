'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, ChevronDown, Search, Sparkles, X } from 'lucide-react'
import { BEANS, ORIGINS, ORIGIN_MAP, ROAST_LABEL, ROAST_COLOR } from '@/data/beans'
import type { Bean } from '@/data/beans'
import ThemeToggle from '@/components/ThemeToggle'

const COLLAPSED_NOTE_COUNT = 14

export default function BeansPage() {
  const [beans, setBeans] = useState<Bean[]>(BEANS)
  const [activeOrigin, setActiveOrigin] = useState('전체')
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set())
  const [noteQuery, setNoteQuery] = useState('')
  const [showAllNotes, setShowAllNotes] = useState(false)
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set())
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const listRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    void fetch('/api/beans', { cache: 'no-store' })
      .then(res => res.ok ? res.json() as Promise<Bean[]> : Promise.reject(res.status))
      .then(data => setBeans(data))
      .catch(() => { /* keep static fallback */ })
  }, [])

  const ALL_NOTES = (() => {
    const freq = new Map<string, number>()
    beans.forEach(b => b.notes.forEach(n => freq.set(n, (freq.get(n) ?? 0) + 1)))
    return ['전체', ...[...freq.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => n)]
  })()
  const NOTE_OPTIONS = ALL_NOTES.filter(n => n !== '전체')

  const normalizedNoteQuery = noteQuery.trim().toLowerCase()
  const matchingNotes = normalizedNoteQuery
    ? NOTE_OPTIONS.filter(n => n.toLowerCase().includes(normalizedNoteQuery))
    : NOTE_OPTIONS
  const visibleNotes = normalizedNoteQuery || showAllNotes
    ? matchingNotes
    : matchingNotes.slice(0, COLLAPSED_NOTE_COUNT)
  const hiddenNoteCount = Math.max(matchingNotes.length - COLLAPSED_NOTE_COUNT, 0)

  const filtered = beans
    .filter(b => activeOrigin === '전체' || ORIGIN_MAP[b.origin] === activeOrigin)
    .filter(b => activeNotes.size === 0 || b.notes.some(n => activeNotes.has(n)))
    .filter(b => !normalizedNoteQuery || b.notes.some(n => n.toLowerCase().includes(normalizedNoteQuery)))

  function toggleNote(n: string) {
    if (n === '전체') { setActiveNotes(new Set()); return }
    setActiveNotes(prev => {
      const next = new Set(prev)
      if (next.has(n)) {
        next.delete(n)
      } else {
        next.add(n)
      }
      return next
    })
  }

  function scrollToCard(index: number) {
    const list = listRef.current
    const card = cardRefs.current[index]
    if (!list || !card) return

    const centeredOffset = card.offsetLeft - (list.clientWidth - card.clientWidth) / 2
    list.scrollTo({ left: centeredOffset, behavior: 'smooth' })
  }

  function handleCardScroll() {
    const list = listRef.current
    if (!list || filtered.length === 0) return

    const listCenter = list.scrollLeft + list.clientWidth / 2
    const nearestIndex = cardRefs.current.reduce((nearest, card, index) => {
      if (!card) return nearest
      const cardCenter = card.offsetLeft + card.clientWidth / 2
      const nearestCard = cardRefs.current[nearest]
      if (!nearestCard) return index

      const currentDistance = Math.abs(cardCenter - listCenter)
      const nearestDistance = Math.abs(nearestCard.offsetLeft + nearestCard.clientWidth / 2 - listCenter)
      return currentDistance < nearestDistance ? index : nearest
    }, 0)

    setActiveCardIndex(nearestIndex)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.idx)
            setVisibleSet(prev => new Set([...prev, idx]))
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    )
    const t = setTimeout(() => {
      setVisibleSet(new Set())
      cardRefs.current.forEach(ref => ref && observer.observe(ref))
    }, 0)
    return () => { clearTimeout(t); observer.disconnect() }
  }, [activeOrigin, activeNotes, normalizedNoteQuery])

  useEffect(() => {
    listRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
    const frameId = window.requestAnimationFrame(() => setActiveCardIndex(0))
    return () => window.cancelAnimationFrame(frameId)
  }, [activeOrigin, activeNotes, normalizedNoteQuery])

  return (
    <div className="relative flex flex-col flex-1 min-h-dvh overflow-x-hidden">

      {/* Background blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-[var(--accent)]/15 blur-3xl dark:opacity-25"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-32 -left-32 h-96 w-96 rounded-full bg-[var(--sub)]/18 blur-3xl dark:opacity-20"
      />

      {/* Header — full width, centered content */}
      <header className="sticky top-0 z-10 border-b border-white/70 bg-white/58 backdrop-blur-2xl shadow-[0_8px_24px_rgba(107,67,42,0.08)] dark:bg-gray-900/80 dark:border-white/10">
        <div className="max-w-3xl mx-auto flex items-center gap-3 h-14 px-4">
          <Link
            href="/"
            className="w-8 h-8 flex items-center justify-center rounded-full no-underline"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </Link>
          <span className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
            원두 알아보기
          </span>
          <div className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/50 shadow-[0_8px_22px_rgba(107,67,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Centered content wrapper */}
      <div className="max-w-3xl mx-auto w-full flex flex-col flex-1 px-4">

        {/* Origin filter chips */}
        <div className="pt-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
          {ORIGINS.map(o => (
            <button
              key={o}
              onClick={() => setActiveOrigin(o)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold backdrop-blur-xl transition-colors ${
                activeOrigin === o
                  ? 'border-transparent bg-[var(--accent)] text-white shadow-[0_8px_18px_rgba(143,174,90,0.22)]'
                  : 'border-white/70 bg-white/60 text-[var(--text-secondary)] dark:border-white/30 dark:bg-white/15 dark:text-white/85'
              }`}
            >
              {o}
            </button>
          ))}
        </div>

        {/* Note filter chips */}
        <section className="pb-3 shrink-0">
          <div className="rounded-2xl border border-white/70 bg-white/42 p-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(107,67,42,0.08)] dark:bg-gray-900/40 dark:border-white/8">
            <div className="flex items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/70 bg-white/60 px-3 py-2 dark:bg-white/8 dark:border-white/10">
                <Search size={14} strokeWidth={2} className="shrink-0" style={{ color: 'var(--text-secondary)' }} />
                <input
                  value={noteQuery}
                  onChange={(e) => setNoteQuery(e.target.value)}
                  placeholder="향미 검색"
                  className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:opacity-70"
                  style={{ color: 'var(--foreground)' }}
                />
                {noteQuery && (
                  <button
                    type="button"
                    onClick={() => setNoteQuery('')}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{ background: 'var(--card-icon-bg)', color: 'var(--text-secondary)' }}
                    aria-label="향미 검색어 지우기"
                  >
                    <X size={12} strokeWidth={2.4} />
                  </button>
                )}
              </div>
              {activeNotes.size > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveNotes(new Set())}
                  className="shrink-0 rounded-xl border border-white/70 bg-white/52 px-3 py-2 text-xs font-semibold dark:bg-white/8 dark:border-white/10"
                  style={{ color: 'var(--accent)' }}
                >
                  초기화
                </button>
              )}
            </div>

            <div
              className={`mt-3 flex flex-wrap gap-1.5 overflow-hidden transition-[max-height] duration-300 ${
                !normalizedNoteQuery && !showAllNotes ? 'max-h-[4.35rem]' : 'max-h-[18rem]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleNote('전체')}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors ${
                  activeNotes.size === 0
                    ? 'border-transparent bg-[var(--foreground)] text-[var(--background)]'
                    : 'border-white/70 bg-white/65 text-[var(--text-secondary)] dark:border-white/30 dark:bg-white/15 dark:text-white/85'
                }`}
              >
                전체 향미
              </button>
              {visibleNotes.map(n => {
                const active = activeNotes.has(n)
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => toggleNote(n)}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors ${
                      active
                        ? 'border-transparent bg-[var(--foreground)] text-[var(--background)]'
                        : 'border-white/70 bg-white/65 text-[var(--text-secondary)] dark:border-white/30 dark:bg-white/15 dark:text-white/85'
                    }`}
                  >
                    {n}
                  </button>
                )
              })}
            </div>

            {matchingNotes.length === 0 && (
              <p className="mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                일치하는 향미가 없습니다.
              </p>
            )}

            {!normalizedNoteQuery && hiddenNoteCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAllNotes(prev => !prev)}
                className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-white/60 bg-white/40 py-2 text-xs font-semibold dark:bg-white/5 dark:border-white/8"
                style={{ color: 'var(--text-secondary)' }}
              >
                {showAllNotes ? '태그 접기' : `태그 ${hiddenNoteCount}개 더 보기`}
                <ChevronDown
                  size={14}
                  strokeWidth={2.2}
                  className={`transition-transform ${showAllNotes ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          </div>
        </section>

        {/* Bean count */}
        <p className="pb-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
          {filtered.length}종의 원두{activeNotes.size > 0 ? ` · 향미 ${activeNotes.size}개 선택` : ''}
        </p>

        {/* Bean list */}
        <main
          ref={listRef}
          onScroll={handleCardScroll}
          className="-mx-4 flex flex-1 snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-smooth px-[7%] pb-10 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0"
        >
          {filtered.length === 0 && (
            <div className="min-w-[86%] snap-center rounded-[1.65rem] border border-[rgba(107,67,42,0.18)] bg-[rgba(255,255,255,0.68)] px-5 py-8 text-center shadow-[0_18px_48px_rgba(107,67,42,0.10)] backdrop-blur-2xl dark:border-white/12 dark:bg-white/10 sm:col-span-2 sm:min-w-0">
              <p className="text-sm font-black" style={{ color: 'var(--foreground)' }}>
                조건에 맞는 원두가 없습니다.
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                산지나 향미 조건을 줄여서 다시 찾아보세요.
              </p>
            </div>
          )}
          {filtered.map((bean, i) => (
            <div
              key={bean.id}
              className={`bean-card group relative min-w-[86%] snap-center overflow-hidden rounded-[1.65rem] border border-white/75 bg-white/[0.44] backdrop-blur-2xl shadow-[0_18px_48px_rgba(107,67,42,0.12),inset_0_1px_0_rgba(255,255,255,0.72)] transition-[filter,opacity,box-shadow] duration-300 dark:bg-gray-900/45 dark:border-white/10 sm:min-w-0${visibleSet.has(i) ? ' bean-card--visible' : ''}`}
              data-mobile-active={activeCardIndex === i ? 'true' : 'false'}
              data-idx={String(i)}
              ref={(el) => { cardRefs.current[i] = el }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-35 blur-2xl transition-opacity group-hover:opacity-55"
                style={{ background: ROAST_COLOR[bean.roast] }}
              />

              {/* Roast hero strip / 로스팅 히어로 영역 */}
              <div
                className="relative min-h-[6.25rem] overflow-hidden px-5 py-4"
                style={{
                  background: `linear-gradient(135deg, ${ROAST_COLOR[bean.roast]}32, ${ROAST_COLOR[bean.roast]}12 58%, rgba(255,255,255,0.18))`,
                  borderBottom: `1px solid ${ROAST_COLOR[bean.roast]}28`,
                }}
              >
                <div
                  aria-hidden
                  className="absolute -bottom-12 -right-8 h-28 w-28 rounded-full border border-white/30 bg-white/18 backdrop-blur-md"
                />
                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <span
                      className="inline-flex items-center rounded-full border border-white/35 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-[0_8px_18px_rgba(0,0,0,0.16)] backdrop-blur-xl"
                      style={{ background: ROAST_COLOR[bean.roast] }}
                    >
                      {bean.origin}
                    </span>
                    <p className="mt-2 max-w-[10rem] text-lg font-black leading-tight" style={{ color: 'var(--foreground)' }}>
                      {bean.name}
                    </p>
                  </div>
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/55 text-3xl leading-none shadow-[0_12px_28px_rgba(107,67,42,0.12)] backdrop-blur-xl">
                    {bean.flag}
                  </span>
                </div>
                <span
                  className="relative mt-3 inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-black"
                  style={{
                    background: ROAST_COLOR[bean.roast],
                    color: '#fff',
                    border: `1px solid ${ROAST_COLOR[bean.roast]}70`,
                  }}
                >
                  {ROAST_LABEL[bean.roast]}
                </span>
              </div>

              {/* Card body / 카드 본문 */}
              <div className="relative px-5 py-4">
                <div className="mb-3">
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {bean.nameEn}
                  </p>
                </div>

                {/* Meta list / 메타 정보 */}
                <div className="mb-4 space-y-1.5">
                  {[
                    ['지역', bean.region],
                    ['품종', bean.variety],
                    ['가공', bean.process],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex min-w-0 items-start gap-3 rounded-2xl border border-[rgba(107,67,42,0.18)] bg-[rgba(255,255,255,0.68)] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-white/12 dark:bg-white/10"
                    >
                      <span className="w-9 shrink-0 text-[10px] font-black leading-5" style={{ color: 'var(--accent)' }}>
                        {label}
                      </span>
                      <span className="min-w-0 flex-1 break-keep text-xs font-semibold leading-5" style={{ color: 'var(--foreground)' }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--foreground)', opacity: 0.84 }}>
                  {bean.desc}
                </p>

                {/* Body & acidity / 바디와 산미 */}
                <div className="mb-4 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-[rgba(107,67,42,0.18)] bg-[rgba(255,255,255,0.68)] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-white/12 dark:bg-white/10">
                    <span className="block text-[10px] font-black" style={{ color: 'var(--accent)' }}>바디</span>
                    <span className="mt-1 block text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{bean.body}</span>
                  </div>
                  <div className="rounded-2xl border border-[rgba(107,67,42,0.18)] bg-[rgba(255,255,255,0.68)] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-white/12 dark:bg-white/10">
                    <span className="block text-[10px] font-black" style={{ color: 'var(--accent)' }}>산미</span>
                    <span className="mt-1 block text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{bean.acidity}</span>
                  </div>
                </div>

                {/* Notes chips / 향미 칩 */}
                <div className="flex flex-wrap gap-1.5">
                  {bean.notes.map(note => (
                    <span
                      key={note}
                      className="rounded-full border border-[rgba(107,67,42,0.16)] bg-[rgba(255,255,255,0.76)] px-2.5 py-1 text-xs font-bold shadow-[0_4px_12px_rgba(107,67,42,0.07),inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-white/12 dark:bg-white/10"
                      style={{ color: 'var(--accent)' }}
                    >
                      {note}
                    </span>
                  ))}
                </div>

                {/* Special badge */}
                {bean.special && (
                  <div
                    className="mt-3 flex items-center gap-1.5 rounded-2xl border border-white/60 bg-white/35 px-3 py-2 text-xs font-bold dark:bg-white/5 dark:border-white/10"
                    style={{ color: 'var(--accent)' }}
                  >
                    <Sparkles size={13} strokeWidth={2.4} />
                    <span>{bean.special}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </main>

        {filtered.length > 1 && (
          <div className="sticky bottom-3 z-10 -mt-7 mb-4 flex justify-center sm:hidden">
            <div className="relative max-w-full overflow-x-auto rounded-full border border-white/70 bg-white/70 px-3 py-2 shadow-[0_14px_34px_rgba(107,67,42,0.16)] backdrop-blur-2xl scrollbar-hide dark:border-white/12 dark:bg-gray-900/72">
              <div className="pointer-events-none flex items-center gap-2">
                {filtered.map((bean, index) => {
                  const active = activeCardIndex === index
                  return (
                    <span
                      key={bean.id}
                      className={`h-2 rounded-full transition-all duration-200 ${
                        active
                          ? '-translate-y-0.5 w-5 bg-[var(--accent)] shadow-[0_6px_14px_rgba(143,174,90,0.42)]'
                          : 'w-2 bg-[rgba(107,67,42,0.28)] dark:bg-white/35'
                      }`}
                    />
                  )
                })}
              </div>
              <input
                type="range"
                min={0}
                max={filtered.length - 1}
                step={1}
                value={Math.min(activeCardIndex, filtered.length - 1)}
                onChange={(event) => {
                  const nextIndex = Number(event.target.value)
                  setActiveCardIndex(nextIndex)
                  scrollToCard(nextIndex)
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="원두 카드 슬라이드"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
