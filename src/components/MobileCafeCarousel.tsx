'use client'

import { memo, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Heart, MapPin } from 'lucide-react'
import type { Cafe } from '@/types/cafe'
import { BREW_LABELS } from '@/types/cafe'
import type { LocationPoint } from '@/types/location'
import { cafeHue } from '@/lib/cafeThumb'

interface MobileCafeCarouselProps {
  cafes: Cafe[]
  selectedCafeId: string | null
  distanceOrigin: LocationPoint | null
  showLocationHint: boolean
  onSelect: (cafe: Cafe) => void
  onRequestLocation: () => void
  onReportNewPlace: () => void
  favoriteCafeIds: Set<string>
  onFavoriteToggle: (cafeId: string) => void
}

const EARTH_RADIUS_KM = 6371
const MAX_VISIBLE_TAGS = 3

export default function MobileCafeCarousel({
  cafes,
  selectedCafeId,
  distanceOrigin,
  showLocationHint,
  onSelect,
  onRequestLocation,
  onReportNewPlace,
  favoriteCafeIds,
  onFavoriteToggle,
}: MobileCafeCarouselProps) {
  const cardRefs = useRef(new Map<string, HTMLElement>())

  // Stable callbacks so React.memo on CafeCarouselCard can skip re-renders.
  const onSelectRef = useRef(onSelect)
  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])
  const stableOnSelect = useCallback((cafe: Cafe) => onSelectRef.current(cafe), [])

  const onFavoriteToggleRef = useRef(onFavoriteToggle)
  useEffect(() => { onFavoriteToggleRef.current = onFavoriteToggle }, [onFavoriteToggle])
  const stableOnFavoriteToggle = useCallback((cafeId: string) => onFavoriteToggleRef.current(cafeId), [])

  // Single stable card-ref handler — card passes its own ID to identify itself.
  const onCardRef = useCallback((cafeId: string, el: HTMLElement | null) => {
    if (el) cardRefs.current.set(cafeId, el)
    else cardRefs.current.delete(cafeId)
  }, [])

  useEffect(() => {
    if (!selectedCafeId) return

    const card = cardRefs.current.get(selectedCafeId)
    if (!card) return

    card.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [selectedCafeId])

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 md:hidden"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {showLocationHint && (
        <div className="pointer-events-auto mx-4 mb-2 flex items-center gap-2 rounded-2xl border border-[#eadfd3] bg-white/92 px-3 py-2 text-[11px] font-bold leading-4 text-[#6b4c2a] shadow-[0_8px_22px_rgba(60,40,20,0.14)] backdrop-blur-md dark:border-white/16 dark:bg-[#171514]/88 dark:text-white/78">
          <MapPin size={13} className="shrink-0 text-[#d66612]" />
          <button type="button" onClick={onRequestLocation} className="min-w-0 flex-1 text-left">
            위치 권한을 허용하면 내 위치 기준으로 가까운 카페를 추천받을 수 있어요.
          </button>
        </div>
      )}

      <div
        className="pointer-events-auto flex touch-pan-x gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {cafes.length > 0 ? cafes.map((cafe, index) => (
          <CafeCarouselCard
            key={cafe.id}
            cafeId={cafe.id}
            onCardRef={onCardRef}
            cafe={cafe}
            priorityImage={index === 0}
            selected={selectedCafeId === cafe.id}
            distanceOrigin={distanceOrigin}
            favorite={favoriteCafeIds.has(cafe.id)}
            onSelect={stableOnSelect}
            onFavoriteToggle={stableOnFavoriteToggle}
          />
        )) : (
          <div className="w-[min(20rem,calc(100vw-2rem))] shrink-0 rounded-2xl border border-dashed border-[#dacdbf] bg-white/94 p-4 text-center shadow-[0_10px_28px_rgba(60,40,20,0.14)] backdrop-blur-md dark:border-white/18 dark:bg-[#171514]/88">
            <p className="text-sm font-black text-[#3d2410] dark:text-white">조건에 맞는 카페가 없어요</p>
            <button
              type="button"
              onClick={onReportNewPlace}
              className="mt-3 h-9 rounded-xl bg-[#d66612] px-4 text-xs font-black text-white"
            >
              새 카페 제보하기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const CafeCarouselCard = memo(function CafeCarouselCard({
  cafeId,
  onCardRef,
  cafe,
  priorityImage,
  selected,
  distanceOrigin,
  favorite,
  onSelect,
  onFavoriteToggle,
}: {
  cafeId: string
  onCardRef: (cafeId: string, el: HTMLElement | null) => void
  cafe: Cafe
  priorityImage: boolean
  selected: boolean
  distanceOrigin: LocationPoint | null
  favorite: boolean
  onSelect: (cafe: Cafe) => void
  onFavoriteToggle: (cafeId: string) => void
}) {
  const articleRef = useCallback(
    (el: HTMLElement | null) => onCardRef(cafeId, el),
    [cafeId, onCardRef],
  )
  const distance = distanceOrigin ? formatDistance(distanceKm(cafe, distanceOrigin)) : '거리 정보 없음'
  const tags = cafe.brewMethods.slice(0, MAX_VISIBLE_TAGS)
  const hasMoreTags = cafe.brewMethods.length > MAX_VISIBLE_TAGS

  return (
    <article
      ref={articleRef}
      className={`w-[15.5rem] shrink-0 overflow-hidden rounded-2xl border bg-white/94 p-2 shadow-[0_10px_28px_rgba(60,40,20,0.14)] backdrop-blur-md transition-all dark:bg-[#171514]/88 ${
        selected
          ? 'border-[#d66612] ring-2 ring-[#f08a24]/25'
          : 'border-[#eadfd3] dark:border-white/16'
      }`}
    >
      <button type="button" onClick={() => onSelect(cafe)} className="block w-full text-left" aria-label={`${cafe.name} 선택`}>
        <div className="relative h-[6.4rem] overflow-hidden rounded-xl bg-[#5c3218]">
          {cafe.images?.[0] ? (
            <Image
              src={cafe.images[0]}
              alt={cafe.name}
              fill
              className="object-cover"
              sizes="248px"
              unoptimized
              priority={priorityImage}
            />
          ) : (
            <div className="absolute inset-0" style={{ background: thumbnailBackground(cafe) }}>
              <span aria-hidden="true" className="absolute inset-0 flex select-none items-center justify-center text-4xl font-black text-white/82">
                {cafe.name[0]}
              </span>
            </div>
          )}
        </div>
      </button>

      <div className="mt-2 flex items-start gap-2">
        <button type="button" onClick={() => onSelect(cafe)} className="min-w-0 flex-1 text-left">
          <h3 className="truncate text-[15px] font-black leading-5 text-[#2c2118] dark:text-white">{cafe.name}</h3>
          <p className="mt-0.5 text-xs font-bold text-[#8a6042] dark:text-white/68">{distance}</p>
        </button>
        <button
          type="button"
          onClick={() => onFavoriteToggle(cafe.id)}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
            favorite
              ? 'border-[#d66612] bg-[#d66612] text-white'
              : 'border-[#eadfd3] bg-white text-[#8a6042] hover:text-[#d66612] dark:border-white/18 dark:bg-white/12 dark:text-white/76'
          }`}
          aria-label={favorite ? `${cafe.name} 저장 해제` : `${cafe.name} 저장`}
          aria-pressed={favorite}
        >
          <Heart size={15} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <button type="button" onClick={() => onSelect(cafe)} className="mt-2 flex h-7 w-full min-w-0 items-center gap-1.5 overflow-hidden text-left">
        {tags.map((tag) => (
          <span key={tag} className="shrink-0 rounded-full bg-[#f5ede5] px-2 py-1 text-[10px] font-black leading-none text-[#7d6149] dark:bg-white/12 dark:text-white/74">
            {BREW_LABELS[tag]}
          </span>
        ))}
        {hasMoreTags && (
          <span className="shrink-0 rounded-full bg-[#f5ede5] px-2 py-1 text-[10px] font-black leading-none text-[#7d6149] dark:bg-white/12 dark:text-white/74">
            ...
          </span>
        )}
      </button>
    </article>
  )
})

function distanceKm(cafe: Cafe, origin: LocationPoint): number {
  const dLat = ((cafe.lat - origin.lat) * Math.PI) / 180
  const dLng = ((cafe.lng - origin.lng) * Math.PI) / 180
  const lat1 = (origin.lat * Math.PI) / 180
  const lat2 = (cafe.lat * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_KM * c
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`
}

function thumbnailBackground(cafe: Cafe): string {
  const hue = cafeHue(cafe.id)

  return [
    'radial-gradient(circle at 34% 32%, rgba(255,255,255,0.34) 0 9%, transparent 10%)',
    `linear-gradient(135deg, hsl(${24 + hue} 56% 32%), hsl(${18 + hue} 40% 18%))`,
  ].join(', ')
}
