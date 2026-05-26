'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LayoutDashboard, LogOut, MapPin, UserRound } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { getAnimalAvatarPath } from '@/lib/animalAvatar'
import ThemeToggle from '@/components/ThemeToggle'
import ProfileEditSheet from '@/components/ProfileEditSheet'

const GEOLOCATION_TIMEOUT_MS = 10000
const GEOLOCATION_MAXIMUM_AGE_MS = 60000

function formatLocationLabel(address: string): string {
  const parts = address.split(' ').filter(Boolean)

  if (parts.length <= 2) return address || '위치 미확인'

  const startIndex = parts[0].endsWith('도') || parts[0] === '경기' ? 1 : 0
  const label = parts.slice(startIndex, startIndex + 2).join(' ')

  return label || '위치 미확인'
}

export default function HomeHeader() {
  const { user, profilePrefs, regenerateNickname, updateProfilePrefs, loginWithKakao, logout } = useUser()
  const [profileEditSheetOpen, setProfileEditSheetOpen] = useState(false)
  const [locationLabel, setLocationLabel] = useState('위치 확인중')
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

  useEffect(() => {
    if (!navigator.geolocation) {
      window.setTimeout(() => setLocationLabel('위치 미확인'), 0)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const controller = new AbortController()

        async function loadLocationLabel(): Promise<void> {
          try {
            const params = new URLSearchParams({
              lat: String(position.coords.latitude),
              lng: String(position.coords.longitude),
            })
            const response = await fetch(`/api/kakao/geocode?${params.toString()}`, {
              signal: controller.signal,
            })

            if (!response.ok) throw new Error('Failed to load location.')

            const data = await response.json() as { address?: string }
            setLocationLabel(formatLocationLabel(data.address ?? ''))
          } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return
            console.warn('Failed to load header location. / 헤더 위치 로드 실패.', error)
            setLocationLabel('위치 미확인')
          }
        }

        void loadLocationLabel()
      },
      (error) => {
        console.warn('Failed to load header geolocation. / 헤더 위치 확인 실패.', error)
        setLocationLabel('위치 미확인')
      },
      {
        enableHighAccuracy: true,
        timeout: GEOLOCATION_TIMEOUT_MS,
        maximumAge: GEOLOCATION_MAXIMUM_AGE_MS,
      },
    )
  }, [])

  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b border-[#f0eded] bg-[#fcf9f8]/90 px-5 py-4 backdrop-blur-md dark:border-white/10 dark:bg-[#161616]/88">
        <div className="relative mx-auto flex max-w-md items-center justify-between">
          <Link href="/map" className="flex items-center gap-1">
            <MapPin size={18} className="text-[#271310] dark:text-[#e3beb8]" />
            <span className="max-w-28 truncate text-[11px] font-bold uppercase tracking-[0.1em] text-[#504442] dark:text-white/64">
              {locationLabel}
            </span>
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
