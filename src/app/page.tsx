'use client'

import Link from 'next/link'
import { useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'

const CARDS = [
  {
    title: '원두 알아보기',
    desc: '산지·로스팅·향미 노트를\n한눈에 확인하세요',
    icon: '☕',
    href: null as string | null,
    bg: 'var(--card-bean-bg)',
    border: 'var(--card-bean-border)',
    iconBg: 'var(--card-bean-icon)',
    comingSoon: false,
  },
  {
    title: '내근처 카페 알아보기',
    desc: '안산 스페셜티 커피\n큐레이션 지도',
    icon: '📍',
    href: '/map' as string | null,
    linkText: '지도 보기',
    bg: 'var(--card-map-bg)',
    border: 'var(--card-map-border)',
    iconBg: 'var(--card-map-icon)',
    comingSoon: false,
  },
  {
    title: '커피 CBTI',
    desc: '나에게 딱 맞는\n커피 스타일 찾기',
    icon: '🧠',
    href: '/cbti' as string | null,
    linkText: '테스트 하기',
    bg: 'var(--card-cbti-bg)',
    border: 'var(--card-cbti-border)',
    iconBg: 'var(--card-cbti-icon)',
    comingSoon: false,
  },
  {
    title: '출시 예정',
    desc: '더 많은 기능들이\n준비 중이에요',
    icon: '✨',
    href: null as string | null,
    bg: 'var(--card-coming-bg)',
    border: 'var(--card-coming-border)',
    iconBg: 'var(--card-coming-icon)',
    comingSoon: true,
  },
] as const

function CardInner({
  card,
  index,
  onClick,
}: {
  card: (typeof CARDS)[number]
  index: number
  onClick?: () => void
}) {
  return (
    <div
      className="card-animate rounded-3xl p-6 border h-full flex flex-col"
      style={{
        background: card.bg,
        borderColor: card.border,
        animationDelay: `${index * 90}ms`,
      }}
      onClick={onClick}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 shrink-0"
        style={{ background: card.iconBg }}
      >
        {card.icon}
      </div>
      <h2 className="text-[15px] font-bold text-gray-900 dark:text-gray-100 mb-1.5 leading-snug">
        {card.title}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line flex-1">
        {card.desc}
      </p>
      {card.comingSoon && (
        <span className="inline-block mt-3 self-start text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full px-2.5 py-0.5">
          출시 예정
        </span>
      )}
      {'linkText' in card && card.href && (
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
          <span>{card.linkText}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const [toastVisible, setToastVisible] = useState(false)
  const [toastTimer, setToastTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  function showToast() {
    if (toastTimer) clearTimeout(toastTimer)
    setToastVisible(true)
    const t = setTimeout(() => setToastVisible(false), 2000)
    setToastTimer(t)
  }

  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <Link href="/" className="flex items-baseline gap-2 no-underline">
          <span className="text-base font-bold tracking-tight text-gray-900 dark:text-gray-100">
            co<span className="text-amber-700 dark:text-amber-500">FFFFF</span>e map
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">안산 스페셜티 커피</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Hero */}
      <div className="px-6 pt-10 pb-4 text-center">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-500 tracking-widest uppercase mb-2">
          Specialty Coffee Curation
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-snug">
          무엇을 찾고 계세요?
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          안산의 진짜 스페셜티 커피를 큐레이션합니다
        </p>
      </div>

      {/* Card Grid */}
      <main className="flex-1 px-4 pb-10 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          {CARDS.map((card, i) =>
            card.href ? (
              <Link key={card.title} href={card.href} className="block no-underline cursor-pointer">
                <CardInner card={card} index={i} />
              </Link>
            ) : (
              <div key={card.title} className="cursor-pointer">
                <CardInner card={card} index={i} onClick={showToast} />
              </div>
            )
          )}
        </div>
      </main>

      {/* Toast */}
      {toastVisible && (
        <div className="toast-animate fixed bottom-8 left-1/2 pointer-events-none z-50 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold px-5 py-2.5 rounded-full shadow-xl">
          준비중이에요 ☕
        </div>
      )}
    </div>
  )
}
