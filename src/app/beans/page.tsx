'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, ChevronDown, Search, X } from 'lucide-react'
import { BEANS, ORIGINS, ORIGIN_MAP, ROAST_LABEL, ROAST_COLOR } from '@/data/beans'

const ALL_NOTES = (() => {
  const freq = new Map<string, number>()
  BEANS.forEach(b => b.notes.forEach(n => freq.set(n, (freq.get(n) ?? 0) + 1)))
  return ['전체', ...[...freq.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => n)]
})()

const NOTE_OPTIONS = ALL_NOTES.filter(n => n !== '전체')
const COLLAPSED_NOTE_COUNT = 14

export default function BeansPage() {
  const [activeOrigin, setActiveOrigin] = useState('전체')
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set())
  const [noteQuery, setNoteQuery] = useState('')
  const [showAllNotes, setShowAllNotes] = useState(false)
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set())
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  const normalizedNoteQuery = noteQuery.trim().toLowerCase()
  const matchingNotes = normalizedNoteQuery
    ? NOTE_OPTIONS.filter(n => n.toLowerCase().includes(normalizedNoteQuery))
    : NOTE_OPTIONS
  const visibleNotes = normalizedNoteQuery || showAllNotes
    ? matchingNotes
    : matchingNotes.slice(0, COLLAPSED_NOTE_COUNT)
  const hiddenNoteCount = Math.max(matchingNotes.length - COLLAPSED_NOTE_COUNT, 0)

  const filtered = BEANS
    .filter(b => activeOrigin === '전체' || ORIGIN_MAP[b.origin] === activeOrigin)
    .filter(b => activeNotes.size === 0 || b.notes.some(n => activeNotes.has(n)))

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
  }, [activeOrigin, activeNotes])

  return (
    <div className="flex flex-col flex-1 min-h-dvh">

      {/* Header */}
      <header
        className="flex items-center gap-3 px-4 h-14 shrink-0"
        style={{ borderBottom: '1px solid var(--card-border)' }}
      >
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
      </header>

      {/* Origin filter chips */}
      <div className="px-4 pt-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
        {ORIGINS.map(o => (
          <button
            key={o}
            onClick={() => setActiveOrigin(o)}
            className="shrink-0 text-xs font-medium rounded-full px-3.5 py-1.5 transition-colors"
            style={{
              background: activeOrigin === o ? 'var(--accent)' : 'var(--card-bg)',
              color: activeOrigin === o ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${activeOrigin === o ? 'transparent' : 'var(--card-border)'}`,
            }}
          >
            {o}
          </button>
        ))}
      </div>

      {/* Note filter chips */}
      <section className="px-4 pb-3 shrink-0">
        <div
          className="rounded-lg border p-3"
          style={{
            background: 'color-mix(in srgb, var(--card-bg) 72%, var(--background))',
            borderColor: 'var(--card-border)',
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-3 py-2"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-secondary)',
              }}
            >
              <Search size={14} strokeWidth={2} className="shrink-0" />
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
                className="shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold"
                style={{
                  background: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--accent)',
                }}
              >
                초기화
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => toggleNote('전체')}
              className="text-[11px] font-semibold rounded-full px-3 py-1.5 transition-colors"
              style={{
                background: activeNotes.size === 0 ? 'var(--foreground)' : 'var(--card-bg)',
                color: activeNotes.size === 0 ? 'var(--background)' : 'var(--text-secondary)',
                border: `1px solid ${activeNotes.size === 0 ? 'transparent' : 'var(--card-border)'}`,
              }}
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
                  className="text-[11px] font-medium rounded-full px-3 py-1.5 transition-colors"
                  style={{
                    background: active ? 'var(--foreground)' : 'var(--card-bg)',
                    color: active ? 'var(--background)' : 'var(--text-secondary)',
                    border: `1px solid ${active ? 'transparent' : 'var(--card-border)'}`,
                  }}
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
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border py-2 text-xs font-semibold"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-secondary)',
              }}
            >
              {showAllNotes ? '접기' : `향미 ${hiddenNoteCount}개 더 보기`}
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
      <p className="px-4 pb-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
        {filtered.length}종의 원두{activeNotes.size > 0 ? ` · 향미 ${activeNotes.size}개 선택` : ''}
      </p>

      {/* Bean list */}
      <main className="flex-1 px-4 pb-10 flex flex-col gap-3">
        {filtered.map((bean, i) => (
          <div
            key={bean.id}
            className={`bean-card rounded-lg border p-5 ${visibleSet.has(i) ? ' bean-card--visible' : ''}`}
            data-idx={String(i)}
            ref={(el) => { cardRefs.current[i] = el }}
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
            }}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-2xl leading-none"
                  style={{ background: 'var(--card-icon-bg)' }}
                >
                  {bean.flag}
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-bold leading-snug" style={{ color: 'var(--foreground)' }}>
                    {bean.name}
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {bean.nameEn}
                  </p>
                </div>
              </div>
              {/* Roast badge */}
              <span
                className="shrink-0 text-xs font-semibold rounded-full px-2.5 py-1"
                style={{
                  background: ROAST_COLOR[bean.roast] + '22',
                  color: ROAST_COLOR[bean.roast],
                  border: `1px solid ${ROAST_COLOR[bean.roast]}44`,
                }}
              >
                {ROAST_LABEL[bean.roast]}
              </span>
            </div>

            {/* Meta row */}
            <div
              className="mt-4 grid grid-cols-1 gap-2 rounded-lg border p-3 text-xs sm:grid-cols-3"
              style={{
                background: 'color-mix(in srgb, var(--background) 52%, transparent)',
                borderColor: 'var(--card-border)',
              }}
            >
              <div>
                <span className="block text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>지역</span>
                <span className="mt-0.5 block leading-snug" style={{ color: 'var(--foreground)' }}>{bean.region}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>품종</span>
                <span className="mt-0.5 block leading-snug" style={{ color: 'var(--foreground)' }}>{bean.variety}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>가공</span>
                <span className="mt-0.5 block leading-snug" style={{ color: 'var(--foreground)' }}>{bean.process}</span>
              </div>
            </div>

            {/* Description */}
            <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--foreground)', opacity: 0.82 }}>
              {bean.desc}
            </p>

            {/* Flavor & Body row */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div
                className="rounded-lg border px-3 py-2"
                style={{ background: 'var(--card-icon-bg)', borderColor: 'var(--card-border)' }}
              >
                <span className="block font-semibold" style={{ color: 'var(--accent)' }}>바디</span>
                <strong className="mt-0.5 block font-semibold leading-snug" style={{ color: 'var(--foreground)' }}>{bean.body}</strong>
              </div>
              <div
                className="rounded-lg border px-3 py-2"
                style={{ background: 'var(--card-icon-bg)', borderColor: 'var(--card-border)' }}
              >
                <span className="block font-semibold" style={{ color: 'var(--accent)' }}>산미</span>
                <strong className="mt-0.5 block font-semibold leading-snug" style={{ color: 'var(--foreground)' }}>{bean.acidity}</strong>
              </div>
            </div>

            {/* Notes chips */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {bean.notes.map(note => (
                <span
                  key={note}
                  className="text-xs rounded-full px-2.5 py-1"
                  style={{
                    background: 'var(--background)',
                    color: 'var(--accent)',
                    border: '1px solid var(--card-border)',
                  }}
                >
                  {note}
                </span>
              ))}
            </div>

            {/* Special badge */}
            {bean.special && (
              <div
                className="mt-3 text-xs font-medium rounded-lg px-3 py-2"
                style={{
                  background: 'var(--card-icon-bg)',
                  color: 'var(--accent)',
                  border: '1px solid var(--card-border)',
                }}
              >
                ✦ {bean.special}
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  )
}
