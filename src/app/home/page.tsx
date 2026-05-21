'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'
import { BEANS } from '@/data/beans'
import { useUser } from '@/hooks/useUser'
import { getAnimalAvatarPath } from '@/lib/animalAvatar'
import ThemeToggle from '@/components/ThemeToggle'

const FEATURED_BEANS = BEANS.slice(0, 4)

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: [0.34, 1.2, 0.64, 1] as const },
  }
}

export default function AppHomePage() {
  const { user, profilePrefs } = useUser()
  const displayName = user?.nickname ?? null
  const siteAnimal = user?.type === 'authenticated' ? user.siteAnimal : user?.animal
  const kakaoProfileImageUrl = user?.type === 'authenticated' ? user.kakaoProfileImageUrl : undefined
  const useKakaoAvatar = profilePrefs.avatarPreference === 'kakao' && Boolean(kakaoProfileImageUrl)
  const avatarSrc = useKakaoAvatar
    ? kakaoProfileImageUrl!
    : siteAnimal ? getAnimalAvatarPath(siteAnimal) : null

  return (
    <main className="flex min-h-dvh flex-col" style={{ background: 'var(--background)' }}>

      {/* App bar */}
      <header
        className="sticky top-0 z-20 flex h-14 items-center justify-between px-4 backdrop-blur-sm"
        style={{
          borderBottom: '1px solid var(--card-border)',
          background: 'color-mix(in srgb, var(--background) 88%, transparent)',
        }}
      >
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#5a2e11]">
            <Image
              src="/image/logo/beenRoad.png"
              alt="원두로"
              width={32}
              height={32}
              className="h-full w-full object-cover"
              priority
            />
          </span>
          <span className="text-sm font-black tracking-tight" style={{ color: 'var(--foreground)' }}>
            원두로
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 space-y-5 px-4 py-5">

        {/* Greeting */}
        <motion.div {...fadeUp(0)} className="flex items-center gap-3">
          {avatarSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarSrc}
              alt={siteAnimal ?? '프로필'}
              className="h-11 w-11 shrink-0 rounded-full object-cover shadow-sm"
              style={{ border: '2px solid var(--card-border)' }}
            />
          )}
          <p className="text-xl font-black leading-snug" style={{ color: 'var(--foreground)' }}>
            {displayName ? `${displayName}님, ` : ''}오늘 어떤 커피 마실까요? ☕
          </p>
        </motion.div>

        {/* Map hero card */}
        <motion.div {...fadeUp(0.05)}>
          <Link
            href="/map"
            className="group relative block overflow-hidden rounded-3xl no-underline"
            style={{ background: '#0e0600', minHeight: 180 }}
          >
            {/* Decorative grid lines */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
              <div className="absolute left-[10%] top-[20%] h-px w-[85%] -rotate-[15deg] bg-[#c4a070]" />
              <div className="absolute left-0 top-[58%] h-px w-full rotate-[8deg] bg-[#c4a070]" />
              <div className="absolute left-[45%] top-0 h-full w-px rotate-[12deg] bg-[#c4a070]" />
              <div className="absolute left-[72%] top-0 h-full w-px -rotate-[8deg] bg-[#c4a070]" />
            </div>
            {/* Amber glow */}
            <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-[#e8720a] opacity-10 blur-3xl" />

            <div className="relative z-10 p-6">
              <span
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: '#e8720a' }}
              >
                원두로 지도
              </span>
              <h2 className="mt-2 text-2xl font-black leading-tight text-white">
                안산 스페셜티<br />카페를 탐색하세요
              </h2>
              <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#e8720a] px-4 py-2.5 text-sm font-black text-white shadow-[0_8px_24px_rgba(232,114,10,0.35)] transition-all group-hover:bg-[#d66612] group-hover:shadow-[0_12px_32px_rgba(232,114,10,0.45)] active:scale-[0.98]">
                <MapPin size={14} /> 지도 열기
              </div>
            </div>

            {/* Decorative marker */}
            <div className="pointer-events-none absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5a2e11] text-white opacity-60 shadow-lg">
              <MapPin size={18} />
            </div>
          </Link>
        </motion.div>

        {/* Service grid */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div {...fadeUp(0.1)}>
            <Link
              href="/cbti"
              className="block rounded-2xl p-5 no-underline transition-all hover:-translate-y-0.5"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                style={{ background: 'var(--card-icon-bg)' }}
              >
                ☕
              </div>
              <h3 className="mt-3 text-sm font-black" style={{ color: 'var(--foreground)' }}>
                커피 CBTI
              </h3>
              <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                내 취향 타입 찾기
              </p>
            </Link>
          </motion.div>

          <motion.div {...fadeUp(0.13)}>
            <Link
              href="/beans"
              className="block rounded-2xl p-5 no-underline transition-all hover:-translate-y-0.5"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                style={{ background: 'var(--card-icon-bg)' }}
              >
                🫘
              </div>
              <h3 className="mt-3 text-sm font-black" style={{ color: 'var(--foreground)' }}>
                원두 정보
              </h3>
              <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                산지별 원두 탐색
              </p>
            </Link>
          </motion.div>
        </div>

        {/* Featured beans */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <p
              className="text-[11px] font-black uppercase tracking-widest"
              style={{ color: 'var(--text-secondary)' }}
            >
              추천 원두
            </p>
            <Link
              href="/beans"
              className="flex items-center gap-1 text-[11px] font-bold no-underline"
              style={{ color: 'var(--accent)' }}
            >
              전체 보기 <ArrowRight size={11} />
            </Link>
          </div>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
            {FEATURED_BEANS.map((bean, i) => (
              <motion.div key={bean.id} {...fadeUp(0.18 + i * 0.04)}>
                <Link
                  href="/beans"
                  className="block w-32 shrink-0 rounded-2xl p-3.5 no-underline transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                  }}
                >
                  <span className="text-2xl">{bean.flag}</span>
                  <p
                    className="mt-2 text-[11px] font-black leading-tight"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {bean.name}
                  </p>
                  <p
                    className="mt-1 text-[10px] leading-snug"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {bean.notes.slice(0, 2).join(' · ')}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Marketplace teaser */}
        <motion.div {...fadeUp(0.3)}>
          <div
            className="flex items-center gap-4 rounded-2xl px-5 py-4"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
            }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
              style={{ background: 'var(--card-icon-bg)' }}
            >
              🛒
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black" style={{ color: 'var(--foreground)' }}>
                원두 마켓플레이스
              </p>
              <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                스페셜티 원두 구매 · 준비 중
              </p>
            </div>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black"
              style={{ background: 'var(--card-icon-bg)', color: 'var(--accent)' }}
            >
              SOON
            </span>
          </div>
        </motion.div>

      </div>

      {/* Footer */}
      <footer className="px-4 py-6 text-center">
        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
          © 2026 원두로
        </p>
      </footer>

    </main>
  )
}
