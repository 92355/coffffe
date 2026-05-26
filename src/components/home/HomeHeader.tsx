'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LayoutDashboard, LogOut, MapPin, UserRound } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { getAnimalAvatarPath } from '@/lib/animalAvatar'
import ThemeToggle from '@/components/ThemeToggle'
import ProfileEditSheet from '@/components/ProfileEditSheet'

export default function HomeHeader() {
  const { user, profilePrefs, regenerateNickname, updateProfilePrefs, loginWithKakao, logout } = useUser()
  const [profileEditSheetOpen, setProfileEditSheetOpen] = useState(false)
  const displayName = user?.nickname ?? '프로필'
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
      <header className="fixed top-0 z-50 w-full border-b border-[#f0eded] bg-[#fcf9f8]/90 px-5 py-4 backdrop-blur-md dark:border-white/10 dark:bg-[#161616]/88">
        <div className="relative mx-auto flex max-w-md items-center justify-between">
          <Link href="/map" className="flex items-center gap-1">
            <MapPin size={18} className="text-[#271310] dark:text-[#e3beb8]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#504442] dark:text-white/64">안산시 단원구</span>
          </Link>

          <Link href="/" className="absolute left-1/2 flex -translate-x-1/2 items-center text-xl font-extrabold tracking-widest">
            <span className="text-[#271310] dark:text-[#e3beb8]">원</span>
            <span className="mx-0.5 text-[#556341] dark:text-[#bdcca3]">두</span>
            <span className="text-[#271310] dark:text-[#e3beb8]">로</span>
          </Link>

          <div className="flex items-center gap-2">
            {user?.type === 'authenticated' && user.isAdmin && (
              <Link
                href="/admin"
                aria-label="관리자"
                className="hidden h-8 w-8 items-center justify-center rounded-full text-[#504442] hover:bg-[#f0eded] dark:text-white/70 dark:hover:bg-white/10 sm:flex"
              >
                <LayoutDashboard size={18} />
              </Link>
            )}
            {user?.type === 'authenticated' ? (
              <button
                type="button"
                onClick={handleLogout}
                aria-label="로그아웃"
                className="hidden h-8 w-8 items-center justify-center rounded-full text-[#504442] hover:bg-[#f0eded] dark:text-white/70 dark:hover:bg-white/10 sm:flex"
              >
                <LogOut size={17} />
              </button>
            ) : (
              <button
                type="button"
                onClick={loginWithKakao}
                className="hidden h-8 rounded-full bg-[#FEE500] px-3 text-[11px] font-bold text-[#191600] sm:block"
              >
                Kakao
              </button>
            )}
            <div className="[&>button]:h-8 [&>button]:w-8 [&>button]:text-[#504442] dark:[&>button]:text-[#bdcca3]">
              <ThemeToggle />
            </div>
            <button
              type="button"
              onClick={() => setProfileEditSheetOpen(true)}
              className="h-8 w-8 overflow-hidden rounded-full border border-[#f0eded] bg-white shadow-sm dark:border-white/12 dark:bg-white/10"
              aria-label="프로필"
              title={displayName}
            >
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt=""
                  width={32}
                  height={32}
                  unoptimized={useKakaoAvatar}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[#504442] dark:text-white/70">
                  <UserRound size={17} />
                </span>
              )}
            </button>
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
