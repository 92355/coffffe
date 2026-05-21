import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Cafe, RoastLevel, BeanOrigin, BrewMethod } from '@/types/cafe'
import { ROAST_LABELS, ORIGIN_LABELS, BREW_LABELS } from '@/types/cafe'
import ThemeToggle from '@/components/ThemeToggle'
import { createSupabaseAdminClient } from '@/lib/supabase'

interface Props {
  params: Promise<{ id: string }>
}

function Tag({ children, color = 'gray' }: { children: React.ReactNode; color?: 'amber' | 'gray' | 'blue' }) {
  const styles = {
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400',
    gray: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  }
  return (
    <span className={`rounded-full px-3 py-1 text-sm font-medium ${styles[color]}`}>
      {children}
    </span>
  )
}

export default async function CafeDetailPage({ params }: Props) {
  const { id } = await params
  const { data } = await createSupabaseAdminClient()
    .from('cafes')
    .select('*')
    .eq('id', id)
    .single()
  if (!data) notFound()
  const cafe: Cafe = {
    id: data.id,
    name: data.name,
    shortDescription: data.short_description,
    fullDescription: data.full_description,
    address: data.address,
    lat: data.lat,
    lng: data.lng,
    roastLevels: data.roast_levels as RoastLevel[],
    beanOrigins: data.bean_origins as BeanOrigin[],
    brewMethods: data.brew_methods as BrewMethod[],
    qualityScore: data.quality_score,
    tags: data.tags,
    openHours: data.open_hours,
    closedDays: data.closed_days,
    images: data.images,
    phone: data.phone ?? undefined,
    instagramHandle: data.instagram_handle ?? undefined,
    kakaoPlaceId: data.kakao_place_id ?? undefined,
    updatedAt: data.updated_at,
  }

  return (
    <div className="flex flex-col flex-1">
      {/* Nav */}
      <nav className="sticky top-0 z-10 flex items-center justify-between h-14 px-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <Link
          href="/map"
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 active:text-gray-900 dark:active:text-gray-100 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          지도로 돌아가기
        </Link>
        <ThemeToggle />
      </nav>

      <main
        className="px-4 py-6 space-y-7"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{cafe.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">{cafe.shortDescription}</p>
        </div>

        {/* Quality score */}
        <div className="flex items-center gap-3 py-4 border-y border-gray-100 dark:border-gray-800">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} className={`h-3 w-3 rounded-full ${
                i <= Math.round(cafe.qualityScore) ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            ))}
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{cafe.qualityScore.toFixed(1)}</span>
          <span className="text-sm text-gray-400 dark:text-gray-500">/ 5.0 큐레이션 점수</span>
        </div>

        {/* Description */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">소개</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[15px]">{cafe.fullDescription}</p>
        </section>

        {/* Coffee info */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">커피 정보</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">로스팅 강도</p>
              <div className="flex flex-wrap gap-2">
                {cafe.roastLevels.map(r => <Tag key={r} color="amber">{ROAST_LABELS[r]}</Tag>)}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">원두 산지</p>
              <div className="flex flex-wrap gap-2">
                {cafe.beanOrigins.map(o => <Tag key={o} color="gray">{ORIGIN_LABELS[o]}</Tag>)}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">추출 방식</p>
              <div className="flex flex-wrap gap-2">
                {cafe.brewMethods.map(m => <Tag key={m} color="blue">{BREW_LABELS[m]}</Tag>)}
              </div>
            </div>
          </div>
        </section>

        {/* Tags */}
        {cafe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {cafe.tags.map(tag => (
              <span key={tag} className="text-xs text-gray-400 dark:text-gray-500">#{tag}</span>
            ))}
          </div>
        )}

        {/* Visit info */}
        <section className="rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">주소</p>
            <p className="text-sm text-gray-800 dark:text-gray-200">{cafe.address}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">영업시간</p>
            <p className="text-sm text-gray-800 dark:text-gray-200">{cafe.openHours}</p>
          </div>
          {cafe.closedDays.length > 0 && (
            <div className="px-4 py-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">정기휴무</p>
              <p className="text-sm text-gray-800 dark:text-gray-200">{cafe.closedDays.join(', ')}</p>
            </div>
          )}
          {cafe.phone && (
            <div className="px-4 py-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">전화</p>
              <a href={`tel:${cafe.phone}`} className="text-sm text-amber-700 dark:text-amber-500 font-medium">{cafe.phone}</a>
            </div>
          )}
          {cafe.instagramHandle && (
            <div className="px-4 py-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">인스타그램</p>
              <p className="text-sm text-gray-800 dark:text-gray-200">{cafe.instagramHandle}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
