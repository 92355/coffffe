'use client'

import Image from 'next/image'
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
              className={`bean-card group relative min-w-[86%] snap-center overflow-hidden rounded-[1.65rem] border border-[rgba(107,67,42,0.18)] bg-white/[0.88] backdrop-blur-2xl shadow-[0_18px_48px_rgba(107,67,42,0.12),inset_0_1px_0_rgba(255,255,255,0.72)] transition-[filter,opacity,box-shadow] duration-300 dark:bg-gray-900/82 dark:border-white/12 sm:min-w-0${visibleSet.has(i) ? ' bean-card--visible' : ''}`}
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
                className="relative overflow-hidden"
                style={{ borderBottom: `1px solid ${ROAST_COLOR[bean.roast]}55` }}
              >
                {/* 이미지 슬롯 — bean.image 추가 시 자동 표시 */}
                {bean.image && (
                  <Image
                    src={bean.image}
                    alt={bean.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
                {/* 그라데이션 오버레이 — 이미지 유무 무관하게 항상 렌더 */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: bean.image
                      ? `linear-gradient(145deg, ${ROAST_COLOR[bean.roast]}dd, ${ROAST_COLOR[bean.roast]}99 65%, ${ROAST_COLOR[bean.roast]}66)`
                      : `linear-gradient(145deg, ${ROAST_COLOR[bean.roast]}88, ${ROAST_COLOR[bean.roast]}55 65%, ${ROAST_COLOR[bean.roast]}28)`,
                  }}
                />
                <div aria-hidden className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full border border-white/20 bg-white/12 backdrop-blur-md" />
                <div aria-hidden className="absolute -top-6 right-12 h-20 w-20 rounded-full bg-white/10 blur-xl" />
                <div className="relative px-5 pb-5 pt-6">
                  <p className="text-[11px] font-black uppercase tracking-widest text-white/70">
                    {bean.origin}
                  </p>
                  <p className="mt-1.5 text-[1.6rem] font-black leading-tight text-white drop-shadow-sm">
                    {bean.name}
                  </p>
                  <span
                    className="mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black text-white"
                    style={{
                      background: 'rgba(0,0,0,0.32)',
                      border: '1px solid rgba(255,255,255,0.32)',
                    }}
                  >
                    {ROAST_LABEL[bean.roast]}
                  </span>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    <div className="rounded-lg px-2 py-1.5" style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.28)' }}>
                      <span className="block text-[9px] font-black text-white/80">바디</span>
                      <span className="block text-[10px] font-black text-white">{bean.body}</span>
                    </div>
                    <div className="rounded-lg px-2 py-1.5" style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.28)' }}>
                      <span className="block text-[9px] font-black text-white/80">산미</span>
                      <span className="block text-[10px] font-black text-white">{bean.acidity}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card body / 카드 본문 */}
              <div className="relative px-5 py-4">
                {/* 설명 — 상단 */}
                <p className="mb-4 rounded-2xl border border-[rgba(107,67,42,0.14)] bg-[rgba(255,255,255,0.68)] px-4 py-3.5 text-[15px] font-medium leading-[1.75] tracking-[-0.01em] text-balance text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-white/12 dark:bg-white/10" style={{ color: 'var(--foreground)' }}>
                  {bean.desc}
                </p>

                <div className="mb-4 border-t border-[rgba(107,67,42,0.12)] pt-4 dark:border-white/10">
                  {/* Meta list / 메타 정보 */}
                  <div className="space-y-1.5">
                    {[
                      ['지역', bean.region],
                      ['품종', bean.variety],
                      ['가공', bean.process],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex min-w-0 items-start gap-3 rounded-2xl border border-[rgba(107,67,42,0.18)] bg-[rgba(255,255,255,0.68)] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-white/12 dark:bg-white/10"
                      >
                        <span className="w-9 shrink-0 text-xs font-black leading-5" style={{ color: 'var(--accent)' }}>
                          {label}
                        </span>
                        <span className="min-w-0 flex-1 break-keep text-sm font-semibold leading-5" style={{ color: 'var(--foreground)' }}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes chips / 향미 태그 박스 */}
                <div className="rounded-2xl border border-[rgba(107,67,42,0.16)] bg-[rgba(255,255,255,0.68)] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-white/12 dark:bg-white/10">
                  <span className="mb-2 block text-xs font-black" style={{ color: 'var(--accent)' }}>향미</span>
                  <div className="flex flex-wrap gap-1.5">
                    {bean.notes.map(note => (
                      <span
                        key={note}
                        className="rounded-full border border-[rgba(107,67,42,0.16)] bg-white/80 px-2.5 py-1 text-xs font-bold dark:border-white/12 dark:bg-white/12"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {note}
                      </span>
                    ))}
                  </div>
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
