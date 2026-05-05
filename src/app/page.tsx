'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'
import SplashScreen from '@/components/SplashScreen'

const CARDS = [
  {
    title: '내근처 카페 알아보기',
    desc: '안산 7곳의 스페셜티 카페\n큐레이션 지도',
    icon: '📍',
    href: '/map' as string | null,
    linkText: '지도 보기',
    bg: 'var(--card-map-bg)',
    border: 'var(--card-map-border)',
    iconBg: 'var(--card-map-icon)',
    comingSoon: false,
    wide: true,
  },
  {
    title: '원두 알아보기',
    desc: '산지·로스팅·향미 노트를\n한눈에 확인하세요',
    icon: '☕',
    href: null as string | null,
    bg: 'var(--card-bean-bg)',
    border: 'var(--card-bean-border)',
    iconBg: 'var(--card-bean-icon)',
    comingSoon: false,
    wide: false,
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
    wide: false,
  },
  {
    title: '출시 예정',
    desc: '더 많은 기능들이 준비 중이에요',
    icon: '✨',
    href: null as string | null,
    bg: 'var(--card-coming-bg)',
    border: 'var(--card-coming-border)',
    iconBg: 'var(--card-coming-icon)',
    comingSoon: true,
    wide: true,
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
  const isWideMap = card.wide && !card.comingSoon
  const isWideComing = card.wide && card.comingSoon

  if (isWideComing) {
    return (
      <div
        className="card-animate rounded-3xl px-6 py-4 border flex flex-row items-center gap-4"
        style={{
          background: card.bg,
          borderColor: card.border,
          animationDelay: `${index * 90}ms`,
        }}
        onClick={onClick}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: card.iconBg }}
        >
          {card.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug">
            {card.title}
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {card.desc}
          </p>
        </div>
        <span className="shrink-0 text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full px-2.5 py-0.5">
          준비중
        </span>
      </div>
    )
  }

  return (
    <div
      className={`${isWideMap ? 'card-map-premium card-wide-animate' : ''} card-animate rounded-3xl border h-full flex flex-col ${isWideMap ? 'p-8' : 'p-6 min-h-[140px]'}`}
      style={{
        background: isWideMap ? undefined : card.bg,
        borderColor: isWideMap ? undefined : card.border,
        animationDelay: `${index * 90}ms`,
      }}
      onClick={onClick}
    >
      <div
        className={`${isWideMap ? 'w-14 h-14 rounded-2xl text-3xl mb-5' : 'w-12 h-12 rounded-2xl text-2xl mb-4'} flex items-center justify-center shrink-0`}
        style={{
          background: card.iconBg,
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.06)',
        }}
      >
        {card.icon}
      </div>
      <h2
        className={`${isWideMap ? 'text-xl' : 'text-[15px]'} font-bold text-gray-900 dark:text-gray-100 mb-1.5 leading-snug`}
      >
        {card.title}
      </h2>
      <p
        className={`${isWideMap ? 'text-base' : 'text-sm'} text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line flex-1`}
      >
        {card.desc}
      </p>
      {'linkText' in card && card.href && (
        isWideMap ? (
          <div className="mt-6 self-start flex items-center gap-1.5 bg-amber-600 dark:bg-amber-500 text-white rounded-full px-5 py-2 text-sm font-semibold shadow-md shadow-amber-200 dark:shadow-amber-900/40">
            <span>{card.linkText}</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            <span>{card.linkText}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        )
      )}
    </div>
  )
}

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastTimer, setToastTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!sessionStorage.getItem('cofffe-splash-seen')) {
      setShowSplash(true)
    }
  }, [])

  function handleSplashDone() {
    sessionStorage.setItem('cofffe-splash-seen', '1')
    setShowSplash(false)
  }

  function showToast() {
    if (toastTimer) clearTimeout(toastTimer)
    setToastVisible(true)
    const t = setTimeout(() => setToastVisible(false), 2000)
    setToastTimer(t)
  }

  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <Link href="/" className="flex items-baseline gap-2 no-underline">
          <span className="text-base font-bold tracking-tight text-gray-900 dark:text-gray-100">
            co<span className="text-amber-600 dark:text-amber-400">FFFFF</span>e map
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">안산 스페셜티 커피</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Hero */}
      <div className="px-6 pt-10 pb-4 text-center">
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400 tracking-widest uppercase mb-2">
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
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          {CARDS.map((card, i) => {
            const colSpan = card.wide ? 'col-span-2' : 'col-span-1'
            return card.href ? (
              <Link key={card.title} href={card.href} className={`${colSpan} block no-underline cursor-pointer`}>
                <CardInner card={card} index={i} />
              </Link>
            ) : (
              <div key={card.title} className={`${colSpan} cursor-pointer`}>
                <CardInner card={card} index={i} onClick={showToast} />
              </div>
            )
          })}
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
