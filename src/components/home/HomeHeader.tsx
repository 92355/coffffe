'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, LogOut, UserRound } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { getAnimalAvatarPath } from '@/lib/animalAvatar'
import ThemeToggle from '@/components/ThemeToggle'
import ProfileEditSheet from '@/components/ProfileEditSheet'

const homeHeaderGlassClass =
  'border border-white/70 bg-white/58 shadow-[0_18px_50px_rgba(107,67,42,0.12)] backdrop-blur-2xl dark:border-white/12 dark:bg-[rgba(20,20,20,0.72)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.10)]'
const homeHeaderButtonClass =
  'border border-white/70 bg-white/50 text-[var(--brown)] shadow-[0_8px_22px_rgba(107,67,42,0.10)] backdrop-blur-xl transition-all hover:bg-white/70 active:scale-[0.98] dark:border-white/12 dark:bg-white/10 dark:text-white dark:shadow-[0_8px_22px_rgba(0,0,0,0.28)] dark:hover:bg-white/16'

export default function HomeHeader() {
  const { user, profilePrefs, regenerateNickname, updateProfilePrefs, loginWithKakao, logout } = useUser()
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
    <>
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
                className="flex h-9 items-center gap-1.5 rounded-full bg-[#FEE500] px-3 text-xs font-black text-[#191600] shadow-[0_10px_24px_rgba(254,229,0,0.35)] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                aria-label="카카오 로그인"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.61 5.08 4.07 6.55l-1.04 3.86a.3.3 0 0 0 .46.32L9.7 19.1A11.3 11.3 0 0 0 12 19.3c5.523 0 10-3.477 10-7.8C22 6.477 17.523 3 12 3" />
                </svg>
                <span className="hidden sm:inline">카카오 로그인</span>
              </button>
            )}
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/50 shadow-[0_8px_22px_rgba(107,67,42,0.10)] backdrop-blur-xl dark:border-white/12 dark:bg-white/10 dark:shadow-[0_8px_22px_rgba(0,0,0,0.28)] [&>button]:h-9 [&>button]:w-9 [&>button]:text-[var(--brown)] dark:[&>button]:text-white">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {profileEditSheetOpen && (
        <ProfileEditSheet
          user={user}
          profilePrefs={profilePrefs}
          onProfilePrefsChange={updateProfilePrefs}
          onRegenerateNickname={regenerateNickname}
          onClose={() => setProfileEditSheetOpen(false)}
        />
      )}
    </>
  )
}
