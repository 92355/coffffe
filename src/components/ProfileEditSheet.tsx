'use client'

import type { ReactNode } from 'react'
import { RefreshCw, X } from 'lucide-react'
import type { ProfilePrefs } from '@/lib/profilePrefs'
import type { User } from '@/hooks/useUser'
import { getAnimalAvatar, getAnimalAvatarPath } from '@/lib/animalAvatar'

interface ProfileEditSheetProps {
  user: User | null
  profilePrefs: ProfilePrefs
  onProfilePrefsChange: (prefs: Partial<ProfilePrefs>) => void
  onRegenerateNickname: () => void
  onClose: () => void
}

export default function ProfileEditSheet({
  user,
  profilePrefs,
  onProfilePrefsChange,
  onRegenerateNickname,
  onClose,
}: ProfileEditSheetProps) {
  const authenticated = user?.type === 'authenticated'
  const siteNickname = user?.type === 'authenticated' ? user.siteNickname : user?.nickname
  const siteAnimalName = user?.type === 'authenticated' ? user.siteAnimal : user?.animal
  const siteAvatar = siteAnimalName ? getAnimalAvatar(siteAnimalName) : '☕'
  const siteAvatarPath = siteAnimalName ? getAnimalAvatarPath(siteAnimalName) : null
  const kakaoNickname = user?.type === 'authenticated' ? user.kakaoNickname : ''
  const kakaoProfileImageUrl = user?.type === 'authenticated' ? user.kakaoProfileImageUrl : undefined
  const displayNickname = profilePrefs.nicknamePreference === 'kakao' && kakaoNickname
    ? kakaoNickname
    : siteNickname ?? '익명 사용자'
  const displayAvatarUsesKakao = profilePrefs.avatarPreference === 'kakao' && Boolean(kakaoProfileImageUrl)

  function saveAndClose(): void {
    if (!authenticated) {
      onProfilePrefsChange({
        nicknamePreference: 'random',
        avatarPreference: 'emoji',
      })
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#1f150f]/55 px-3 pb-0 md:items-center md:p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-edit-title"
        className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-[#eadccb] bg-[#fbf8f3] text-[#5a2e11] shadow-[0_24px_70px_rgba(34,20,10,0.28)] md:rounded-3xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-[#eadccb] bg-white px-5 py-4">
          <div>
            <h2 id="profile-edit-title" className="text-lg font-black">내 정보 수정</h2>
            <p className="mt-1 text-xs font-bold text-[#8a6042]">지도와 저장 목록에 보이는 프로필을 고릅니다.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#80624a] hover:bg-[#f8efe6]"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="rounded-2xl border border-[#eadccb] bg-white p-4 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#f2d8c1] text-4xl leading-none">
              {displayAvatarUsesKakao ? (
                // External Kakao profile image. / 외부 카카오 프로필 이미지.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={kakaoProfileImageUrl} alt="" className="h-full w-full object-cover" />
              ) : siteAvatarPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={siteAvatarPath} alt={siteAnimalName} className="h-full w-full object-cover" />
              ) : (
                siteAvatar
              )}
            </div>
            <p className="mt-3 truncate text-base font-black">{displayNickname}</p>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-black">프로필 사진</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <PreferenceCard
                active={profilePrefs.avatarPreference === 'emoji' || !authenticated}
                title="원두로 친구들"
                description="원두로 친구들 프로필을 사용합니다"
                onClick={() => onProfilePrefsChange({ avatarPreference: 'emoji' })}
              >
                {siteAvatarPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={siteAvatarPath} alt="" className="h-9 w-9 object-cover" />
                ) : (
                  <span className="text-2xl">{siteAvatar}</span>
                )}
              </PreferenceCard>
              <PreferenceCard
                active={profilePrefs.avatarPreference === 'kakao' && authenticated}
                title="카카오톡 프로필"
                description={authenticated ? '카톡 프로필 사용' : '카카오 로그인 후 사용 가능'}
                disabled={!authenticated || !kakaoProfileImageUrl}
                onClick={() => onProfilePrefsChange({ avatarPreference: 'kakao' })}
              >
                {kakaoProfileImageUrl ? (
                  // External Kakao profile image. / 외부 카카오 프로필 이미지.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={kakaoProfileImageUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span className="text-2xl">☕</span>
                )}
              </PreferenceCard>
            </div>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-black">닉네임</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <PreferenceCard
                active={profilePrefs.nicknamePreference === 'random' || !authenticated}
                title="원두로 닉네임"
                description={siteNickname ?? '랜덤 닉네임'}
                onClick={() => onProfilePrefsChange({ nicknamePreference: 'random' })}
                action={
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onRegenerateNickname()
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-[#eadccb] bg-white text-[#6f3b17] hover:bg-[#fff7ed]"
                    aria-label="닉네임 새로고침"
                    title="닉네임 새로고침"
                  >
                    <RefreshCw size={14} />
                  </button>
                }
              >
                {siteAvatarPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={siteAvatarPath} alt="" className="h-9 w-9 object-cover" />
                ) : (
                  <span className="text-xl">{siteAvatar}</span>
                )}
              </PreferenceCard>
              <PreferenceCard
                active={profilePrefs.nicknamePreference === 'kakao' && authenticated}
                title="카카오 닉네임"
                description={authenticated ? kakaoNickname : '카카오 로그인 후 사용 가능'}
                disabled={!authenticated}
                onClick={() => onProfilePrefsChange({ nicknamePreference: 'kakao' })}
              >
                <span className="text-xl">K</span>
              </PreferenceCard>
            </div>
          </div>
        </div>

        <footer className="border-t border-[#eadccb] bg-white px-5 pt-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <button
            type="button"
            onClick={saveAndClose}
            className="h-11 w-full rounded-xl bg-[#d66612] px-4 text-sm font-black text-white shadow-[0_12px_28px_rgba(150,72,14,0.28)] transition-colors hover:bg-[#c45b0d]"
          >
            저장
          </button>
        </footer>
      </section>
    </div>
  )
}

interface PreferenceCardProps {
  active: boolean
  title: string
  description: string
  disabled?: boolean
  action?: ReactNode
  children: ReactNode
  onClick: () => void
}

function PreferenceCard({
  active,
  title,
  description,
  disabled = false,
  action,
  children,
  onClick,
}: PreferenceCardProps) {
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={onClick}
      aria-pressed={active}
      aria-disabled={disabled}
      onKeyDown={(event) => {
        if (disabled || (event.key !== 'Enter' && event.key !== ' ')) return

        event.preventDefault()
        onClick()
      }}
      className={`flex min-h-24 items-center gap-3 rounded-2xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${
        active
          ? 'border-[#d66612] bg-[#fff7ed] shadow-[0_8px_22px_rgba(150,72,14,0.12)]'
          : 'border-[#eadccb] bg-white hover:bg-[#f8efe6]'
      } ${disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer'}`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f2d8c1] text-[#5a2e11]">
        {children}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black text-[#5a2e11]">{title}</span>
        <span className="mt-1 block truncate text-xs font-bold text-[#8a6042]">{description}</span>
      </span>
      {action}
    </div>
  )
}
