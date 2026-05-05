'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import { BEANS, ORIGINS, ORIGIN_MAP, ROAST_LABEL, ROAST_COLOR } from '@/data/beans'

export default function BeansPage() {
  const [activeOrigin, setActiveOrigin] = useState('전체')
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set())
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  const filtered = activeOrigin === '전체'
    ? BEANS
    : BEANS.filter(b => ORIGIN_MAP[b.origin] === activeOrigin)

  useEffect(() => {
    setVisibleSet(new Set())
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
      cardRefs.current.forEach(ref => ref && observer.observe(ref))
    }, 0)
    return () => { clearTimeout(t); observer.disconnect() }
  }, [activeOrigin])

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

      {/* Filter chips */}
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

      {/* Bean count */}
      <p className="px-4 pb-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
        {filtered.length}종의 원두
      </p>

      {/* Bean list */}
      <main className="flex-1 px-4 pb-10 flex flex-col gap-3">
        {filtered.map((bean, i) => (
          <div
            key={bean.id}
            className={`bean-card rounded-2xl border p-5${visibleSet.has(i) ? ' bean-card--visible' : ''}`}
            data-idx={String(i)}
            ref={(el) => { cardRefs.current[i] = el }}
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
            }}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl leading-none">{bean.flag}</span>
                <div>
                  <h2 className="text-[15px] font-bold leading-snug" style={{ color: 'var(--foreground)' }}>
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
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>{bean.flag} {bean.region}</span>
              <span>🌱 {bean.variety}</span>
              <span>⚙️ {bean.process}</span>
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--foreground)', opacity: 0.75 }}>
              {bean.desc}
            </p>

            {/* Flavor & Body row */}
            <div className="flex gap-4 mb-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>바디 · <strong style={{ color: 'var(--foreground)' }}>{bean.body}</strong></span>
              <span>산미 · <strong style={{ color: 'var(--foreground)' }}>{bean.acidity}</strong></span>
            </div>

            {/* Notes chips */}
            <div className="flex flex-wrap gap-1.5">
              {bean.notes.map(note => (
                <span
                  key={note}
                  className="text-xs rounded-full px-2.5 py-0.5"
                  style={{
                    background: 'var(--card-icon-bg)',
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
