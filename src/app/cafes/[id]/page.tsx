import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, AtSign, MapPin, Phone } from 'lucide-react'
import type { Cafe } from '@/types/cafe'
import { BREW_LABELS, ORIGIN_LABELS, ROAST_LABELS } from '@/types/cafe'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { cafeHue } from '@/lib/cafeThumb'
import { googleMapUrl, kakaoMapUrl, naverMapUrl } from '@/lib/mapNavigation'
import CafeFootprintPanel from '@/components/CafeFootprintPanel'

interface PageProps {
  params: Promise<{ id: string }>
}

interface DatabaseCafe {
  id: string
  name: string
  short_description: string
  full_description: string
  address: string
  lat: number
  lng: number
  roast_levels: Cafe['roastLevels']
  bean_origins: Cafe['beanOrigins']
  brew_methods: Cafe['brewMethods']
  quality_score: number
  tags: string[]
  open_hours: string
  closed_days: string[]
  images: string[]
  phone: string | null
  instagram_handle: string | null
  kakao_place_id: string | null
}

function toCafe(row: DatabaseCafe): Cafe {
  return {
    id: row.id,
    name: row.name,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    roastLevels: row.roast_levels,
    beanOrigins: row.bean_origins,
    brewMethods: row.brew_methods,
    qualityScore: row.quality_score,
    tags: row.tags,
    openHours: row.open_hours,
    closedDays: row.closed_days,
    images: row.images,
    phone: row.phone ?? undefined,
    instagramHandle: row.instagram_handle ?? undefined,
    kakaoPlaceId: row.kakao_place_id ?? undefined,
  }
}

async function fetchCafeById(cafeId: string): Promise<Cafe | null> {
  const { data, error } = await createSupabaseAdminClient()
    .from('cafes')
    .select('*')
    .eq('id', cafeId)
    .maybeSingle()

  if (error) {
    console.error('Failed to load cafe by id. / 카페 단건 로드 실패.', error)
    return null
  }
  if (!data) return null

  return toCafe(data as DatabaseCafe)
}

export default async function CafeDetailPage({ params }: PageProps) {
  const { id } = await params
  const cafe = await fetchCafeById(id)
  if (!cafe) notFound()

  const hue = cafeHue(cafe.id)
  const placeholderBg = [
    `radial-gradient(circle at 25% 35%, transparent 22%, rgba(255,255,255,0.10) 22.5%, rgba(255,255,255,0.10) 26%, transparent 26.5%)`,
    `radial-gradient(circle at 68% 58%, transparent 17%, rgba(255,255,255,0.07) 17.5%, rgba(255,255,255,0.07) 21%, transparent 21.5%)`,
    `hsl(${hue}, 42%, 38%)`,
  ].join(', ')

  return (
    <main className="min-h-dvh bg-[#fbf5ed] pb-12 dark:bg-[#15110d]">
      <div className="mx-auto max-w-2xl px-4 pt-4">
        <Link
          href="/map"
          className="inline-flex items-center gap-1 text-xs font-black text-[#5a2e11] hover:underline dark:text-white/75"
        >
          <ArrowLeft size={14} />지도로 돌아가기
        </Link>

        <section className="mt-4 overflow-hidden rounded-3xl border border-[#eadccb] bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="relative h-[200px] w-full">
            {cafe.images?.[0] ? (
              <Image src={cafe.images[0]} alt={cafe.name} fill className="object-cover" unoptimized />
            ) : (
              <div className="absolute inset-0" style={{ background: placeholderBg }}>
                <span className="absolute inset-0 flex select-none items-center justify-center text-6xl font-black text-white/80">
                  {cafe.name[0]}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4 p-5">
            <header className="space-y-1">
              <h1 className="text-2xl font-black text-[#2c2118] dark:text-white">{cafe.name}</h1>
              <p className="text-sm font-bold text-[#7d6149] dark:text-white/70">{cafe.shortDescription}</p>
            </header>

            <div className="flex flex-wrap gap-1.5">
              {cafe.roastLevels.map((roast) => (
                <span key={roast} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  {ROAST_LABELS[roast]}
                </span>
              ))}
              {cafe.beanOrigins.map((origin) => (
                <span key={origin} className="rounded-full bg-[#f5ede5] px-2.5 py-1 text-xs font-semibold text-[#7d6149] dark:bg-white/12 dark:text-white/72">
                  {ORIGIN_LABELS[origin]}
                </span>
              ))}
              {cafe.brewMethods.map((method) => (
                <span key={method} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {BREW_LABELS[method]}
                </span>
              ))}
            </div>

            <div className="space-y-1.5 text-xs font-bold text-[#7d6149] dark:text-white/65">
              <p className="flex items-start gap-1"><MapPin size={13} className="mt-0.5" />{cafe.address}</p>
              <p>영업 {cafe.openHours}</p>
              <p>휴무 {cafe.closedDays.length > 0 ? cafe.closedDays.join(', ') : '정보 없음'}</p>
            </div>

            {(cafe.phone || cafe.instagramHandle) && (
              <div className="flex items-center gap-2">
                {cafe.phone && (
                  <a
                    href={`tel:${cafe.phone}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadfd3] bg-white text-[#6b432a] dark:border-white/18 dark:bg-white/12 dark:text-white/80"
                    aria-label={`${cafe.name} 전화`}
                  >
                    <Phone size={14} />
                  </a>
                )}
                {cafe.instagramHandle && (
                  <a
                    href={`https://instagram.com/${cafe.instagramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadfd3] bg-white text-[#6b432a] hover:text-[#E1306C] dark:border-white/18 dark:bg-white/12 dark:text-white/80"
                    aria-label={`${cafe.name} 인스타그램`}
                  >
                    <AtSign size={14} />
                  </a>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 pt-1">
              <a href={naverMapUrl(cafe.name)} target="_blank" rel="noopener noreferrer"
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-black text-white hover:opacity-90"
                style={{ background: '#03C75A' }}>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[9px] font-black">N</span>
                네이버
              </a>
              <a href={kakaoMapUrl(cafe.name)} target="_blank" rel="noopener noreferrer"
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-black text-[#381e1f] hover:opacity-90"
                style={{ background: '#FEE500' }}>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black/10 text-[9px] font-black">K</span>
                카카오
              </a>
              <a href={googleMapUrl(cafe.name)} target="_blank" rel="noopener noreferrer"
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-black text-white hover:opacity-90"
                style={{ background: '#4285F4' }}>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[9px] font-black">G</span>
                구글
              </a>
            </div>
          </div>
        </section>

        <div className="mt-5">
          <CafeFootprintPanel cafeId={cafe.id} />
        </div>
      </div>
    </main>
  )
}
