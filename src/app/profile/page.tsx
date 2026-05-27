'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Heart, Loader2, LogIn, LogOut, MessageSquare, RefreshCw, Trash2, TriangleAlert } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { getAnimalAvatarPath } from '@/lib/animalAvatar'
import type { ReviewDbRow } from '@/lib/repositories/footprint'
import type { CafeReport } from '@/types/report'
import type { Cafe } from '@/types/cafe'

type Tab = 'favorites' | 'reviews' | 'reports'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:  { label: '검토중',  color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  approved: { label: '반영됨',  color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  rejected: { label: '반려',    color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, profilePrefs, regenerateNickname, updateProfilePrefs, loginWithKakao, logout } = useUser()
  const [tab, setTab] = useState<Tab>('favorites')
  const [favorites, setFavorites] = useState<Cafe[]>([])
  const [reviews, setReviews] = useState<ReviewDbRow[]>([])
  const [reports, setReports] = useState<CafeReport[]>([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const isAuthenticated = user?.type === 'authenticated'
  const avatarSrc = user && 'siteAnimal' in user
    ? getAnimalAvatarPath(user.siteAnimal)
    : user && 'animal' in user
      ? getAnimalAvatarPath(user.animal)
      : null
  const kakaoAvatarSrc = isAuthenticated
    ? (user.profileImageUrl ?? user.kakaoProfileImageUrl ?? null)
    : null
  const displayAvatar = profilePrefs.avatarPreference === 'kakao' ? (kakaoAvatarSrc ?? avatarSrc) : avatarSrc
  const displayNickname = isAuthenticated && profilePrefs.nicknamePreference === 'kakao'
    ? user.kakaoNickname
    : user?.nickname ?? ''

  useEffect(() => {
    setLoading(true)
    if (tab === 'favorites') {
      void fetch('/api/me/favorites')
        .then(r => r.json())
        .then(async (data: { cafeIds?: string[] }) => {
          if (!data.cafeIds?.length) { setFavorites([]); return }
          const all = await fetch('/api/cafes').then(r => r.json()) as Cafe[]
          const ids = new Set(data.cafeIds)
          setFavorites(all.filter(c => ids.has(c.id)))
        })
        .finally(() => setLoading(false))
    } else if (tab === 'reviews') {
      if (!isAuthenticated) { setLoading(false); return }
      void fetch('/api/me/reviews')
        .then(r => r.json())
        .then((data: { reviews?: ReviewDbRow[] }) => setReviews(data.reviews ?? []))
        .finally(() => setLoading(false))
    } else {
      if (!isAuthenticated) { setLoading(false); return }
      void fetch('/api/me/reports')
        .then(r => r.json())
        .then((data: { reports?: CafeReport[] }) => setReports(data.reports ?? []))
        .finally(() => setLoading(false))
    }
  }, [tab, isAuthenticated])

  async function handleDeleteReview(reviewId: string, cafeId: string) {
    setDeletingId(reviewId)
    try {
      await fetch(`/api/cafes/${cafeId}/reviews/${reviewId}`, { method: 'DELETE' })
      setReviews(prev => prev.filter(r => r.id !== reviewId))
    } finally {
      setDeletingId(null)
    }
  }

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-[var(--main-bg,#fff)] pb-12 text-[#201b16] dark:bg-[#161616] dark:text-[#f3f0ef]">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-5 pb-3 pt-12">
        <button type="button" onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eadfd3] bg-white/60 text-[#6b432a] dark:border-white/18 dark:bg-white/10 dark:text-white">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-lg font-black">내 정보</h1>
      </div>

      {/* 프로필 카드 */}
      <div className="mx-5 mb-5 rounded-2xl border border-[#eadfd3] bg-white/70 p-5 dark:border-white/12 dark:bg-white/8">
        {!isAuthenticated && (
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-[#fff8ef] px-4 py-3 dark:bg-[#2c2118]/60">
            <LogIn size={15} className="shrink-0 text-[#b45a12]" />
            <span className="text-xs font-semibold text-[#6b432a] dark:text-white/80">카카오 로그인하면 활동 내역을 저장할 수 있어요</span>
            <button type="button" onClick={loginWithKakao} className="ml-auto shrink-0 rounded-lg bg-[#FEE500] px-3 py-1.5 text-xs font-black text-[#381e1f]">
              로그인
            </button>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#f0e8df]">
            {displayAvatar ? (
              <Image src={displayAvatar} alt="프로필" fill className="object-cover" unoptimized />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-3xl">🐾</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-black">{displayNickname}</p>
            {isAuthenticated && (
              <p className="mt-0.5 text-xs text-[#8b7a6e] dark:text-white/50">카카오 계정 연결됨</p>
            )}
          </div>
          <button type="button" onClick={regenerateNickname} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#eadfd3] bg-white/60 text-[#6b432a] dark:border-white/18 dark:bg-white/10 dark:text-white" aria-label="닉네임 재생성">
            <RefreshCw size={14} />
          </button>
        </div>

        {isAuthenticated && (
          <div className="mt-4 space-y-2.5 border-t border-[#eee4d8] pt-4 dark:border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#5f4634] dark:text-white/80">닉네임 표시</span>
              <div className="flex gap-1.5">
                {(['random', 'kakao'] as const).map(v => (
                  <button key={v} type="button" onClick={() => updateProfilePrefs({ nicknamePreference: v })}
                    className={`rounded-full px-3 py-1 text-xs font-black transition-colors ${profilePrefs.nicknamePreference === v ? 'bg-[#b45a12] text-white' : 'bg-[#f0e8df] text-[#6b432a] dark:bg-white/12 dark:text-white/70'}`}>
                    {v === 'random' ? '랜덤' : '카카오'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#5f4634] dark:text-white/80">아바타</span>
              <div className="flex gap-1.5">
                {(['emoji', 'kakao'] as const).map(v => (
                  <button key={v} type="button" onClick={() => updateProfilePrefs({ avatarPreference: v })}
                    className={`rounded-full px-3 py-1 text-xs font-black transition-colors ${profilePrefs.avatarPreference === v ? 'bg-[#b45a12] text-white' : 'bg-[#f0e8df] text-[#6b432a] dark:bg-white/12 dark:text-white/70'}`}>
                    {v === 'emoji' ? '동물' : '카카오'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isAuthenticated && (
          <button type="button" onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#eadfd3] py-2.5 text-sm font-black text-[#6b432a] dark:border-white/18 dark:text-white/70">
            <LogOut size={14} />
            로그아웃
          </button>
        )}
      </div>

      {/* 탭 */}
      <div className="flex gap-0 border-b border-[#eee4d8] px-5 dark:border-white/10">
        {([
          { key: 'favorites', label: '찜한 카페', icon: Heart },
          { key: 'reviews',   label: '내 한줄평', icon: MessageSquare },
          { key: 'reports',   label: '제보 내역', icon: TriangleAlert },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-black transition-colors ${tab === key ? 'border-b-2 border-[#b45a12] text-[#b45a12]' : 'text-[#8b7a6e] dark:text-white/50'}`}>
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="px-5 pt-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-[#b45a12]" />
          </div>
        ) : (
          <>
            {tab === 'favorites' && (
              favorites.length === 0
                ? <Empty text="찜한 카페가 없어요" />
                : <div className="space-y-3">
                    {favorites.map(cafe => (
                      <Link key={cafe.id} href={`/cafes/${cafe.id}`}
                        className="flex items-center gap-3 rounded-2xl border border-[#eadfd3] bg-white/70 p-3 dark:border-white/12 dark:bg-white/8">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#f0e8df]">
                          {cafe.images?.[0] && <Image src={cafe.images[0]} alt={cafe.name} fill className="object-cover" unoptimized />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black">{cafe.name}</p>
                          <p className="truncate text-xs text-[#8b7a6e] dark:text-white/50">{cafe.address}</p>
                        </div>
                        <Heart size={15} className="shrink-0 fill-[#d66612] text-[#d66612]" />
                      </Link>
                    ))}
                  </div>
            )}

            {tab === 'reviews' && (
              !isAuthenticated
                ? <LoginRequired />
                : reviews.length === 0
                  ? <Empty text="작성한 한줄평이 없어요" />
                  : <div className="space-y-3">
                      {reviews.map(review => (
                        <div key={review.id} className="rounded-2xl border border-[#eadfd3] bg-white/70 p-4 dark:border-white/12 dark:bg-white/8">
                          <div className="flex items-start justify-between gap-2">
                            <p className="flex-1 text-sm leading-relaxed text-[#3d2410] dark:text-white/90">{review.text}</p>
                            <button type="button" onClick={() => handleDeleteReview(review.id, review.cafe_id)}
                              disabled={deletingId === review.id}
                              className="shrink-0 text-[#c0a898] transition-colors hover:text-red-500 dark:text-white/30 dark:hover:text-red-400">
                              {deletingId === review.id
                                ? <Loader2 size={14} className="animate-spin" />
                                : <Trash2 size={14} />}
                            </button>
                          </div>
                          <p className="mt-2 text-[10px] text-[#b8aa9b] dark:text-white/35">
                            {new Date(review.created_at).toLocaleDateString('ko-KR')} · 카페 {review.cafe_id}
                          </p>
                        </div>
                      ))}
                    </div>
            )}

            {tab === 'reports' && (
              !isAuthenticated
                ? <LoginRequired />
                : reports.length === 0
                  ? <Empty text="제보 내역이 없어요" />
                  : <div className="space-y-3">
                      {reports.map(report => {
                        const s = STATUS_LABEL[report.status] ?? STATUS_LABEL.pending
                        return (
                          <div key={report.id} className="rounded-2xl border border-[#eadfd3] bg-white/70 p-4 dark:border-white/12 dark:bg-white/8">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-black">{report.name ?? '이름 없음'}</p>
                              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black ${s.color}`}>{s.label}</span>
                            </div>
                            {report.address && <p className="mt-1 text-xs text-[#8b7a6e] dark:text-white/50">{report.address}</p>}
                            {report.memo && <p className="mt-1.5 text-xs leading-relaxed text-[#5f4634] dark:text-white/70">{report.memo}</p>}
                            <p className="mt-2 text-[10px] text-[#b8aa9b] dark:text-white/35">
                              {report.type === 'new_place' ? '새 카페 제보' : '정보 수정 제보'} · {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                        )
                      })}
                    </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="py-12 text-center text-sm font-semibold text-[#b8aa9b] dark:text-white/35">
      {text}
    </div>
  )
}

function LoginRequired() {
  return (
    <div className="py-12 text-center text-sm font-semibold text-[#b8aa9b] dark:text-white/35">
      로그인 후 확인할 수 있어요
    </div>
  )
}
