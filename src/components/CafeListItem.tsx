'use client'

import { Heart, MapPin, Star } from 'lucide-react'
import type { Cafe } from '@/types/cafe'
import type { LocationPoint } from '@/types/location'

interface CafeListItemProps {
  cafe: Cafe
  selected: boolean
  distanceOrigin: LocationPoint | null
  onSelect: (cafe: Cafe) => void
  favorite: boolean
  onFavoriteToggle: (cafeId: string) => void
}

const EARTH_RADIUS_KM = 6371

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

function thumbnailStyle(cafe: Cafe) {
  const hue = cafe.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 30

  return {
    backgroundImage: `
      radial-gradient(circle at 34% 32%, rgba(255,255,255,0.34) 0 9%, transparent 10%),
      linear-gradient(135deg, hsl(${24 + hue} 56% 32%), hsl(${18 + hue} 40% 18%))
    `,
  }
}

export default function CafeListItem({
  cafe,
  selected,
  distanceOrigin,
  onSelect,
  favorite,
  onFavoriteToggle,
}: CafeListItemProps) {
  const km = distanceOrigin ? distanceKm(cafe, distanceOrigin) : null
  const distance = km === null
    ? '위치 확인중'
    : km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`

  return (
    <article
      className={`group w-full rounded-2xl border bg-white p-2 text-left shadow-[0_8px_22px_rgba(80,54,28,0.06)] transition-all ${
        selected
          ? 'border-[#d66612] ring-2 ring-[#f08a24]/20'
          : 'border-[#eee4d8] hover:border-[#e09a5c]'
      }`}
    >
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onSelect(cafe)}
          className="relative h-[74px] w-[112px] shrink-0 overflow-hidden rounded-xl bg-[#5c3218] text-left"
          style={cafe.images?.[0]
            ? { backgroundImage: `url(${cafe.images[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : thumbnailStyle(cafe)}
          aria-label={`${cafe.name} 선택`}
        >
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent" />
          {selected && (
            <span className="absolute left-2 top-2 rounded-full bg-[#d66612] px-2 py-0.5 text-[10px] font-black text-white">
              선택됨
            </span>
          )}
        </button>
        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex items-start justify-between gap-2">
            <button type="button" onClick={() => onSelect(cafe)} className="min-w-0 flex-1 text-left">
              <h3 className="truncate text-sm font-black text-[#2c2118]">{cafe.name}</h3>
            </button>
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="flex items-center gap-1 text-xs font-black text-[#b45a15]">
                <Star size={12} fill="currentColor" />
                {cafe.qualityScore.toFixed(1)}
              </span>
              <button
                type="button"
                onClick={() => onFavoriteToggle(cafe.id)}
                className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
                  favorite
                    ? 'border-[#d66612] bg-[#fff1e7] text-[#d66612]'
                    : 'border-[#eadfd3] bg-white text-[#9c8b7c] hover:text-[#d66612]'
                }`}
                aria-label={favorite ? `${cafe.name} 저장 해제` : `${cafe.name} 저장`}
                aria-pressed={favorite}
              >
                <Heart size={14} fill={favorite ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
          <button type="button" onClick={() => onSelect(cafe)} className="block w-full text-left">
            <p className="mt-1 truncate text-xs font-semibold text-[#8b7a68]">{cafe.shortDescription}</p>
            <p className="mt-1 truncate text-xs text-[#9c8b7c]">{cafe.address}</p>
          </button>
          <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-[#8f7b68]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>영업 중</span>
            <MapPin size={11} />
            <span>{distance}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
