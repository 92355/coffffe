'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MapPin, Coffee, Brain, Sparkles } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import SplashScreen from '@/components/SplashScreen'

const CARDS = [
  {
    title: '내근처 카페 알아보기',
    desc: '안산 7곳의 스페셜티 카페\n큐레이션 지도',
    Icon: MapPin,
    href: '/map' as string | null,
    linkText: '지도 보기',
    comingSoon: false,
    wide: true,
  },
  {
    title: '원두 알아보기',
    desc: '산지·로스팅·향미 노트를\n한눈에 확인하세요',
    Icon: Coffee,
    href: '/beans' as string | null,
    linkText: '둘러보기',
    comingSoon: false,
    wide: false,
  },
  {
    title: '커피 CBTI',
    desc: '나에게 딱 맞는\n커피 스타일 찾기',
    Icon: Brain,
    href: '/cbti' as string | null,
    linkText: '테스트 하기',
    comingSoon: false,
    wide: false,
  },
  {
    title: '출시 예정',
    desc: '더 많은 기능들이 준비 중이에요',
    Icon: Sparkles,
    href: null as string | null,
    comingSoon: true,
    wide: true,
  },
] as const

const rings = (wide: boolean) => wide ? (
  <>
    <span style={{ position:'absolute', top:-52, right:-52, width:220, height:220, borderRadius:'50%', border:'1px solid var(--card-ring)', pointerEvents:'none' }} />
    <span style={{ position:'absolute', top:-18, right:-18, width:148, height:148, borderRadius:'50%', border:'1px solid var(--card-ring)', pointerEvents:'none', opacity:0.7 }} />
    <span style={{ position:'absolute', top:16,  right:16,  width:88,  height:88,  borderRadius:'50%', border:'1px solid var(--card-ring)', pointerEvents:'none', opacity:0.45 }} />
  </>
) : (
  <>
    <span style={{ position:'absolute', top:-24, right:-24, width:112, height:112, borderRadius:'50%', border:'1px solid var(--card-ring)', pointerEvents:'none' }} />
    <span style={{ position:'absolute', top:6,   right:6,   width:70,  height:70,  borderRadius:'50%', border:'1px solid var(--card-ring)', pointerEvents:'none', opacity:0.6 }} />
  </>
)

function CardInner({
  card,
  index,
  onClick,
}: {
  card: (typeof CARDS)[number]
  index: number
  onClick?: () => void
}) {
  const isWideMap    = card.wide && !card.comingSoon
  const isWideComing = card.wide && card.comingSoon
  const { Icon } = card

  /* ── 출시 예정 (wide, horizontal) ── */
  if (isWideComing) {
    return (
      <div
        className="card-animate rounded-2xl px-5 py-4 border flex flex-row items-center gap-4"
        style={{
          position: 'relative', overflow: 'hidden',
          background: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          animationDelay: `${index * 90}ms`,
        }}
        onClick={onClick}
      >
        {rings(false)}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--card-icon-bg)' }}
        >
          <Icon size={20} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold leading-snug" style={{ color: 'var(--foreground)' }}>
            {card.title}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {card.desc}
          </p>
        </div>
        <span
          className="shrink-0 text-xs font-medium rounded-full px-3 py-1"
          style={{
            color: 'var(--accent)',
            background: 'var(--card-icon-bg)',
            border: '1px solid var(--card-border)',
          }}
        >
          준비중
        </span>
      </div>
    )
  }

  /* ── 일반 카드 (지도 wide / 원두·CBTI narrow) ── */
  return (
    <div
      className={`${isWideMap ? 'card-map-premium card-wide-animate' : ''} card-animate rounded-2xl border h-full flex flex-col ${isWideMap ? 'p-7' : 'p-5 min-h-[148px]'}`}
      style={{
        position: 'relative', overflow: 'hidden',
        background: isWideMap ? undefined : 'var(--card-bg)',
        borderColor: isWideMap ? undefined : 'var(--card-border)',
        animationDelay: `${index * 90}ms`,
      }}
      onClick={onClick}
    >
      {rings(isWideMap)}

      {/* Icon */}
      <div
        className={`${isWideMap ? 'w-13 h-13' : 'w-11 h-11'} rounded-xl flex items-center justify-center shrink-0 ${isWideMap ? 'mb-5' : 'mb-4'}`}
        style={{
          width: isWideMap ? 52 : 44,
          height: isWideMap ? 52 : 44,
          background: 'var(--card-icon-bg)',
        }}
      >
        <Icon
          size={isWideMap ? 24 : 20}
          strokeWidth={1.5}
          style={{ color: 'var(--accent)' }}
        />
      </div>

      {/* Title */}
      <h2
        className={`${isWideMap ? 'text-[18px]' : 'text-[14px]'} font-semibold leading-snug mb-1.5`}
        style={{ color: 'var(--foreground)' }}
      >
        {card.title}
      </h2>

      {/* Description */}
      <p
        className={`${isWideMap ? 'text-sm' : 'text-xs'} leading-relaxed whitespace-pre-line flex-1`}
        style={{ color: 'var(--text-secondary)' }}
      >
        {card.desc}
      </p>

      {/* CTA */}
      {'linkText' in card && card.href && (
        isWideMap ? (
          <div
            className="mt-5 self-start flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold"
            style={{
              background: 'var(--accent)',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(197,139,92,0.35)',
            }}
          >
            <span>{card.linkText}</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        ) : (
          <div
            className="mt-3 flex items-center gap-1 text-xs font-medium"
            style={{ color: 'var(--accent)' }}
          >
            <span>{card.linkText}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
      <header
        className="flex items-center justify-between px-4 h-14 shrink-0"
        style={{ borderBottom: '1px solid var(--card-border)' }}
      >
        <Link href="/" className="flex items-baseline gap-2 no-underline">
          <span className="text-base font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            co<span style={{ color: 'var(--accent)' }}>FFFFF</span>e map
          </span>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>안산 스페셜티 커피</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Hero */}
      <div className="px-6 pt-10 pb-4 text-center">
        <p className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--accent)' }}>
          Specialty Coffee Curation
        </p>
        <h1 className="text-2xl font-bold mb-2 leading-snug" style={{ color: 'var(--foreground)' }}>
          무엇을 찾고 계세요?
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          안산의 진짜 스페셜티 커피를 큐레이션합니다
        </p>
      </div>

      {/* Card Grid */}
      <main className="flex-1 px-4 pb-10 pt-2">
        <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
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
        <div
          className="toast-animate fixed bottom-8 left-1/2 pointer-events-none z-50 text-sm font-semibold px-5 py-2.5 rounded-full"
          style={{
            background: 'var(--foreground)',
            color: 'var(--background)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          준비중이에요 ☕
        </div>
      )}
    </div>
  )
}
