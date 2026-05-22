'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, type Variants } from 'framer-motion'
import { ArrowRight, Bean, Coffee, Compass, LayoutDashboard, LogIn, LogOut, MapPin, ShoppingBag, UserRound } from 'lucide-react'
import { BEANS } from '@/data/beans'
import { useUser } from '@/hooks/useUser'
import { getAnimalAvatarPath } from '@/lib/animalAvatar'
import ThemeToggle from '@/components/ThemeToggle'
import ProfileEditSheet from '@/components/ProfileEditSheet'

const FEATURED_BEANS = BEANS.slice(0, 4)
const homeGlassCardClass =
  'relative overflow-hidden border border-white/75 bg-[linear-gradient(145deg,rgba(255,255,255,0.68),rgba(255,255,255,0.30))] shadow-[0_20px_54px_rgba(107,67,42,0.14),inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-2xl transition-all dark:border-white/14 dark:bg-[linear-gradient(145deg,rgba(255,255,255,0.13),rgba(255,255,255,0.06))] dark:shadow-[0_20px_54px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,0.12)]'
const homeGlassShineClass =
  'pointer-events-none absolute inset-x-4 top-0 h-px bg-white/90 dark:bg-white/24'
const homeGlassGlowClass =
  'pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[var(--accent)]/20 blur-2xl dark:bg-[var(--accent)]/12'
const homeGlassIconClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/70 text-[var(--primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_10px_22px_rgba(107,67,42,0.10)] transition-transform group-hover:scale-110 dark:border-white/12 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_22px_rgba(0,0,0,0.22)]'
const homeHeaderGlassClass =
  'border border-white/70 bg-white/58 shadow-[0_18px_50px_rgba(107,67,42,0.12)] backdrop-blur-2xl dark:border-white/12 dark:bg-[rgba(20,20,20,0.72)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.10)]'
const homeHeaderButtonClass =
  'border border-white/70 bg-white/50 text-[var(--brown)] shadow-[0_8px_22px_rgba(107,67,42,0.10)] backdrop-blur-xl transition-all hover:bg-white/70 active:scale-[0.98] dark:border-white/12 dark:bg-white/10 dark:text-white dark:shadow-[0_8px_22px_rgba(0,0,0,0.28)] dark:hover:bg-white/16'

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
    iconBgClass: 'bg-[var(--accent-soft)] dark:bg-[rgba(160,192,104,0.20)]',
  },
  {
    href: '/beans',
    title: '원두 정보',
    description: '산지별 원두 탐색',
    icon: Bean,
    iconBgClass: 'bg-[var(--sub-soft)] dark:bg-[rgba(192,138,90,0.20)]',
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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(143,174,90,0.22),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(192,138,90,0.26),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.76),rgba(240,229,218,0.68))] dark:bg-[radial-gradient(circle_at_10%_6%,rgba(160,192,104,0.16),transparent_30%),radial-gradient(circle_at_92%_14%,rgba(192,138,90,0.18),transparent_28%),linear-gradient(180deg,rgba(12,12,12,0.98),rgba(24,21,18,0.94))]"
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-28 h-64 w-64 rounded-full bg-[var(--accent)]/18 blur-3xl dark:bg-[var(--accent)]/10"
        animate={{ x: [0, 22, 0], y: [0, -16, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-72 h-72 w-72 rounded-full bg-[var(--sub)]/20 blur-3xl dark:bg-[var(--sub)]/10"
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
        <div className={`mx-auto flex h-14 max-w-2xl items-center justify-between rounded-2xl px-3.5 ${homeHeaderGlassClass}`}>
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
              원<span className="text-[#8FAE5A]">두</span>로
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setProfileEditSheetOpen(true)}
              className={`flex h-9 items-center gap-1.5 rounded-full px-2 text-xs font-black ${homeHeaderButtonClass}`}
              aria-label="프로필"
              title={displayName ?? '프로필'}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/70 dark:bg-white/14">
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
            {user?.type === 'authenticated' && user.isAdmin && (
              <Link
                href="/admin"
                className={`flex h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-black no-underline ${homeHeaderButtonClass}`}
                aria-label="관리자"
              >
                <LayoutDashboard size={14} />
                <span className="hidden sm:inline">관리자</span>
              </Link>
            )}
            {user?.type === 'authenticated' ? (
              <button
                type="button"
                onClick={handleLogout}
                className={`flex h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-black ${homeHeaderButtonClass}`}
                aria-label="로그아웃"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={loginWithKakao}
                className="flex h-9 items-center gap-1.5 rounded-full bg-[var(--brown)] px-2.5 text-xs font-black text-white shadow-[0_10px_24px_rgba(107,67,42,0.18)] transition-all hover:-translate-y-0.5 active:scale-[0.98] dark:bg-[var(--accent)] dark:text-[#151412] dark:shadow-[0_10px_24px_rgba(160,192,104,0.20)]"
                aria-label="카카오 로그인"
              >
                <LogIn size={14} />
                <span className="hidden sm:inline">로그인</span>
              </button>
            )}
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/50 shadow-[0_8px_22px_rgba(107,67,42,0.10)] backdrop-blur-xl dark:border-white/12 dark:bg-white/10 dark:shadow-[0_8px_22px_rgba(0,0,0,0.28)] [&>button]:h-9 [&>button]:w-9 [&>button]:text-[var(--brown)] dark:[&>button]:text-white">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-2xl flex-1 space-y-5 px-4 py-5">

        {/* Greeting */}
        <motion.div
          {...fadeUp(0)}
          className="relative overflow-hidden rounded-3xl border border-white/75 bg-white/[0.42] p-4 shadow-[0_20px_60px_rgba(107,67,42,0.14),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-2xl dark:border-white/12 dark:bg-white/[0.08] dark:shadow-[0_20px_60px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.10)]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/85 dark:bg-white/18"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[var(--accent)]/18 blur-2xl dark:bg-[var(--accent)]/10"
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
              <p className="text-[11px] font-black uppercase text-[var(--brown)]/70 dark:text-[var(--accent)]/85">
                Today coffee
              </p>
              <p className="mt-1 text-xl font-black leading-snug text-[var(--foreground)]">
                {displayName && (
                  <span className="mb-1 inline-flex items-center rounded-2xl border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(240,229,218,0.58))] px-3 py-1 text-[1.35rem] font-black text-[var(--brown)] shadow-[0_12px_28px_rgba(107,67,42,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-white/14 dark:bg-[linear-gradient(135deg,rgba(160,192,104,0.24),rgba(255,255,255,0.08))] dark:text-white dark:shadow-[0_12px_28px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.12)]">
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
            className="group relative block min-h-[220px] overflow-hidden rounded-[2rem] border border-white/18 no-underline shadow-[0_28px_70px_rgba(107,67,42,0.25)] dark:border-white/12 dark:shadow-[0_30px_80px_rgba(0,0,0,0.58)]"
            style={{ background: 'linear-gradient(135deg, #151412, #6B432A)' }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
              <div className="absolute left-[10%] top-[20%] h-px w-[85%] -rotate-[15deg] bg-[var(--sub)]" />
              <div className="absolute left-0 top-[58%] h-px w-full rotate-[8deg] bg-[var(--sub)]" />
              <div className="absolute left-[45%] top-0 h-full w-px rotate-[12deg] bg-[var(--sub)]" />
              <div className="absolute left-[72%] top-0 h-full w-px -rotate-[8deg] bg-[var(--sub)]" />
            </div>
            <div className="pointer-events-none absolute -bottom-16 -right-12 h-52 w-52 rounded-full bg-[var(--accent)]/20 blur-3xl dark:bg-[var(--accent)]/14" />
            <div className="pointer-events-none absolute inset-x-4 top-4 rounded-3xl border border-white/14 bg-white/10 p-3 backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.07]">
              <div className="flex items-center gap-2 text-xs font-black text-white/60 dark:text-white/72">
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
              className="pointer-events-none absolute right-5 top-[92px] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/18 bg-white/12 text-white shadow-lg backdrop-blur-xl dark:border-white/14 dark:bg-white/[0.08]"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <MapPin size={18} />
            </motion.div>
          </Link>
        </motion.div>

        {/* Service grid */}
        <div className="grid grid-cols-2 gap-3">
          {serviceCards.map(({ href, title, description, icon: Icon, iconBgClass }, index) => (
            <motion.div key={title} {...fadeUp(0.1 + index * 0.03)}>
              <Link
                href={href}
                className={`group block min-h-[8.25rem] rounded-[1.65rem] p-5 no-underline hover:-translate-y-1 hover:shadow-[0_26px_62px_rgba(107,67,42,0.20)] dark:hover:shadow-[0_26px_62px_rgba(0,0,0,0.48)] ${homeGlassCardClass}`}
              >
                <span aria-hidden className={homeGlassShineClass} />
                <span aria-hidden className={homeGlassGlowClass} />
                <div
                  className={`relative ${homeGlassIconClass} ${iconBgClass}`}
                >
                  <Icon size={19} />
                </div>
                <h3 className="relative mt-3 break-keep text-sm font-black text-[var(--foreground)]">
                  {title}
                </h3>
                <p className="relative mt-1 break-keep text-[11px] leading-relaxed text-[var(--text-secondary)]">
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
                  className={`group flex h-full w-full flex-col rounded-[1.35rem] p-3.5 no-underline hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(107,67,42,0.18)] dark:hover:shadow-[0_22px_50px_rgba(0,0,0,0.46)] ${homeGlassCardClass}`}
                >
                  <span aria-hidden className={homeGlassShineClass} />
                  <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[var(--sub)]/18 blur-2xl dark:bg-[var(--sub)]/10" />
                  <span className="relative text-2xl leading-none">{bean.flag}</span>
                  <p
                    className="relative mt-2 overflow-hidden break-keep text-[11px] font-black leading-tight [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {bean.name}
                  </p>
                  <p
                    className="relative mt-1 overflow-hidden break-keep text-[10px] leading-snug [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
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
          <div className={`flex items-center gap-4 rounded-[1.65rem] px-5 py-4 ${homeGlassCardClass}`}>
            <span aria-hidden className={homeGlassShineClass} />
            <span aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[var(--accent)]/18 blur-2xl dark:bg-[var(--accent)]/10" />
            <div className={`relative bg-[var(--card-icon-bg)] dark:bg-white/10 ${homeGlassIconClass}`}>
              <ShoppingBag size={18} />
            </div>
            <div className="relative min-w-0 flex-1">
              <p className="break-keep text-sm font-black" style={{ color: 'var(--foreground)' }}>
                원두 마켓플레이스
              </p>
              <p className="mt-0.5 break-keep text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                스페셜티 원두 구매 · 준비 중
              </p>
            </div>
            <span className="relative shrink-0 rounded-full border border-white/70 bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-black text-[var(--primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-white/12 dark:bg-[rgba(160,192,104,0.22)] dark:text-white">
              SOON
            </span>
          </div>
        </motion.div>

      </div>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-6 text-center">
        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
          © 2026 원<span className="text-[#8FAE5A]">두</span>로
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
