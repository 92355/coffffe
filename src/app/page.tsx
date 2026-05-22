'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, type Variants } from 'framer-motion'
import { ArrowRight, Bean, Coffee, Compass, LogIn, LogOut, MapPin, ShoppingBag, UserRound } from 'lucide-react'
import { BEANS } from '@/data/beans'
import { useUser } from '@/hooks/useUser'
import { getAnimalAvatarPath } from '@/lib/animalAvatar'
import ThemeToggle from '@/components/ThemeToggle'
import ProfileEditSheet from '@/components/ProfileEditSheet'

const FEATURED_BEANS = BEANS.slice(0, 4)

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 24, filter: 'blur(10px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.58, delay, ease: [0.22, 1, 0.36, 1] as const },
  }
}

const serviceCards = [
  {
    href: '/cbti',
    title: '커피 CBTI',
    description: '내 취향 타입 찾기',
    icon: Coffee,
    tint: 'var(--accent-soft)',
  },
  {
    href: '/beans',
    title: '원두 정보',
    description: '산지별 원두 탐색',
    icon: Bean,
    tint: 'var(--sub-soft)',
  },
]

const beanContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.15,
    },
  },
}

const beanItem: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function AppHomePage() {
  const {
    user,
    profilePrefs,
    regenerateNickname,
    updateProfilePrefs,
    loginWithKakao,
    logout,
  } = useUser()
  const [profileEditSheetOpen, setProfileEditSheetOpen] = useState(false)
  const displayName = user?.nickname ?? null
  const siteAnimal = user?.type === 'authenticated' ? user.siteAnimal : user?.animal
  const kakaoProfileImageUrl = user?.type === 'authenticated' ? user.kakaoProfileImageUrl : undefined
  const useKakaoAvatar = profilePrefs.avatarPreference === 'kakao' && Boolean(kakaoProfileImageUrl)
  const avatarSrc = useKakaoAvatar
    ? kakaoProfileImageUrl!
    : siteAnimal ? getAnimalAvatarPath(siteAnimal) : null

  async function handleLogout(): Promise<void> {
    try {
      await logout()
    } catch (error) {
      console.warn('Failed to logout. / 로그아웃에 실패했습니다.', error)
    }
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(143,174,90,0.22),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(192,138,90,0.26),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.76),rgba(240,229,218,0.68))]"
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-28 h-64 w-64 rounded-full bg-[var(--accent)]/18 blur-3xl"
        animate={{ x: [0, 22, 0], y: [0, -16, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-72 h-72 w-72 rounded-full bg-[var(--sub)]/20 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* App bar */}
      <header
        className="sticky top-0 z-20 px-4 pt-3"
        style={{
          background: 'linear-gradient(180deg, color-mix(in srgb, var(--background) 86%, transparent), transparent)',
        }}
      >
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between rounded-2xl border border-white/70 bg-white/58 px-3.5 shadow-[0_18px_50px_rgba(107,67,42,0.12)] backdrop-blur-2xl">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--brown)]">
              <Image
                src="/image/logo/beenRoad.png"
                alt="원두로"
                width={36}
                height={36}
                className="h-full w-full object-cover"
                priority
              />
            </span>
            <span className="text-sm font-black tracking-tight text-[var(--foreground)]">
              원두로
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setProfileEditSheetOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-full border border-white/70 bg-white/50 px-2 text-xs font-black text-[var(--brown)] shadow-[0_8px_22px_rgba(107,67,42,0.10)] backdrop-blur-xl transition-all hover:bg-white/70 active:scale-[0.98]"
              aria-label="프로필"
              title={displayName ?? '프로필'}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/70">
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt=""
                    width={24}
                    height={24}
                    unoptimized={useKakaoAvatar}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound size={14} />
                )}
              </span>
              <span className="hidden max-w-16 truncate sm:inline">{displayName ?? '프로필'}</span>
            </button>
            {user?.type === 'authenticated' ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-9 items-center gap-1.5 rounded-full border border-white/70 bg-white/50 px-2.5 text-xs font-black text-[var(--brown)] shadow-[0_8px_22px_rgba(107,67,42,0.10)] backdrop-blur-xl transition-all hover:bg-white/70 active:scale-[0.98]"
                aria-label="로그아웃"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={loginWithKakao}
                className="flex h-9 items-center gap-1.5 rounded-full bg-[var(--brown)] px-2.5 text-xs font-black text-white shadow-[0_10px_24px_rgba(107,67,42,0.18)] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                aria-label="카카오 로그인"
              >
                <LogIn size={14} />
                <span className="hidden sm:inline">로그인</span>
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-2xl flex-1 space-y-5 px-4 py-5">

        {/* Greeting */}
        <motion.div
          {...fadeUp(0)}
          className="relative overflow-hidden rounded-3xl border border-white/75 bg-white/[0.42] p-4 shadow-[0_20px_60px_rgba(107,67,42,0.14),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-2xl"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/85"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[var(--accent)]/18 blur-2xl"
          />
          <div className="relative flex items-center gap-3">
          {avatarSrc && (
            <Image
              src={avatarSrc}
              alt={siteAnimal ?? '프로필'}
              width={44}
              height={44}
              unoptimized={useKakaoAvatar}
              className="h-11 w-11 shrink-0 rounded-full object-cover shadow-sm"
              style={{ border: '2px solid var(--card-border)' }}
            />
          )}
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase text-[var(--brown)]/70">
                Today coffee
              </p>
              <p className="mt-1 text-xl font-black leading-snug text-[var(--foreground)]">
                {displayName && (
                  <span className="mb-1 inline-flex items-center rounded-2xl border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(240,229,218,0.58))] px-3 py-1 text-[1.35rem] font-black text-[var(--brown)] shadow-[0_12px_28px_rgba(107,67,42,0.18),inset_0_1px_0_rgba(255,255,255,0.9)]">
                    {displayName}님
                  </span>
                )}
                <span className="block font-black text-[var(--foreground)]">오늘 어떤 커피 마실까요?</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Map hero card */}
        <motion.div {...fadeUp(0.05)}>
          <Link
            href="/map"
            className="group relative block min-h-[220px] overflow-hidden rounded-[2rem] border border-white/18 bg-[linear-gradient(135deg,var(--primary),var(--brown))] no-underline shadow-[0_28px_70px_rgba(107,67,42,0.25)]"
          >
            <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
              <div className="absolute left-[10%] top-[20%] h-px w-[85%] -rotate-[15deg] bg-[var(--sub)]" />
              <div className="absolute left-0 top-[58%] h-px w-full rotate-[8deg] bg-[var(--sub)]" />
              <div className="absolute left-[45%] top-0 h-full w-px rotate-[12deg] bg-[var(--sub)]" />
              <div className="absolute left-[72%] top-0 h-full w-px -rotate-[8deg] bg-[var(--sub)]" />
            </div>
            <div className="pointer-events-none absolute -bottom-16 -right-12 h-52 w-52 rounded-full bg-[var(--accent)]/20 blur-3xl" />
            <div className="pointer-events-none absolute inset-x-4 top-4 rounded-3xl border border-white/14 bg-white/10 p-3 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs font-black text-white/60">
                <Compass size={14} /> 근처 스페셜티 카페 탐색 중
              </div>
            </div>

            <div className="relative z-10 p-6 pt-20">
              <span
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: 'var(--accent)' }}
              >
                원두로 지도
              </span>
              <h2 className="mt-2 text-2xl font-black leading-tight text-white">
                안산 스페셜티<br />카페를 탐색하세요
              </h2>
              <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-black text-[var(--primary)] shadow-[0_12px_28px_rgba(143,174,90,0.28)] transition-all group-hover:-translate-y-0.5 group-hover:shadow-[0_16px_36px_rgba(143,174,90,0.38)] active:scale-[0.98]">
                <MapPin size={14} /> 지도 열기
              </div>
            </div>

            <motion.div
              className="pointer-events-none absolute right-5 top-[92px] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/18 bg-white/12 text-white shadow-lg backdrop-blur-xl"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <MapPin size={18} />
            </motion.div>
          </Link>
        </motion.div>

        {/* Service grid */}
        <div className="grid grid-cols-2 gap-3">
          {serviceCards.map(({ href, title, description, icon: Icon, tint }, index) => (
            <motion.div key={title} {...fadeUp(0.1 + index * 0.03)}>
              <Link
                href={href}
                className="group block rounded-2xl border border-white/70 bg-white/58 p-5 no-underline shadow-[0_16px_40px_rgba(107,67,42,0.10)] backdrop-blur-2xl transition-all hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(107,67,42,0.16)]"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--primary)] transition-transform group-hover:scale-110"
                  style={{ background: tint }}
                >
                  <Icon size={19} />
                </div>
                <h3 className="mt-3 text-sm font-black text-[var(--foreground)]">
                  {title}
                </h3>
                <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                  {description}
                </p>
              </Link>
            </motion.div>
          ))}
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
          <motion.div
            variants={beanContainer}
            initial="hidden"
            animate="show"
            className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide"
          >
            {FEATURED_BEANS.map((bean) => (
              <motion.div key={bean.id} variants={beanItem} className="h-[6.4rem] w-32 shrink-0">
                <Link
                  href="/beans"
                  className="flex h-full w-full flex-col rounded-2xl border border-white/70 bg-white/56 p-3.5 no-underline shadow-[0_12px_30px_rgba(107,67,42,0.08)] backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(107,67,42,0.15)]"
                >
                  <span className="text-2xl leading-none">{bean.flag}</span>
                  <p
                    className="mt-2 truncate whitespace-nowrap text-[11px] font-black leading-tight"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {bean.name}
                  </p>
                  <p
                    className="mt-1 truncate whitespace-nowrap text-[10px] leading-snug"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {bean.notes.slice(0, 2).join(' · ')}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Marketplace teaser */}
        <motion.div {...fadeUp(0.3)}>
          <div className="flex items-center gap-4 rounded-2xl border border-white/70 bg-white/58 px-5 py-4 shadow-[0_16px_40px_rgba(107,67,42,0.10)] backdrop-blur-2xl">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--primary)]"
              style={{ background: 'var(--card-icon-bg)' }}
            >
              <ShoppingBag size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black" style={{ color: 'var(--foreground)' }}>
                원두 마켓플레이스
              </p>
              <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                스페셜티 원두 구매 · 준비 중
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-black text-[var(--primary)]">
              SOON
            </span>
          </div>
        </motion.div>

      </div>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-6 text-center">
        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
          © 2026 원두로
        </p>
      </footer>

      {profileEditSheetOpen && (
        <ProfileEditSheet
          user={user}
          profilePrefs={profilePrefs}
          onProfilePrefsChange={updateProfilePrefs}
          onRegenerateNickname={regenerateNickname}
          onClose={() => setProfileEditSheetOpen(false)}
        />
      )}

    </main>
  )
}
