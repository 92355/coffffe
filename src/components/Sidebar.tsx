'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Bell,
  BookOpen,
  Brain,
  Coffee,
  CupSoda,
  Map,
  PawPrint,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import type { Cafe, FilterState } from '@/types/cafe'
import type { LocationPoint } from '@/types/location'
import CafeListItem from '@/components/CafeListItem'
import FilterBar from '@/components/FilterBar'
import SearchBar from '@/components/SearchBar'
import ThemeToggle from '@/components/ThemeToggle'

interface SidebarProps {
  cafes: Cafe[]
  filters: FilterState
  onFilterChange: (next: FilterState) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedCafe: Cafe | null
  distanceOrigin: LocationPoint | null
  onCafeSelect: (cafe: Cafe) => void
  activeQuickCategory: string | null
  onQuickCategoryChange: (value: string | null) => void
  onClearSelection: () => void
  onReportNewPlace: () => void
  favoriteCafeIds: Set<string>
  onFavoriteToggle: (cafeId: string) => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

const QUICK_CATEGORIES = [
  { label: '전체', value: null, icon: Sparkles, activeColor: '#5a2e11', activeShadow: 'rgba(90,46,17,0.25)' },
  { label: '스페셜티', value: '스페셜티', icon: Coffee, activeColor: '#b45a12', activeShadow: 'rgba(180,90,18,0.28)' },
  { label: '로스터리', value: '로스터리', icon: CupSoda, activeColor: '#7c4d2e', activeShadow: 'rgba(124,77,46,0.28)' },
  { label: '디저트', value: '디저트', icon: BookOpen, activeColor: '#c04b6a', activeShadow: 'rgba(192,75,106,0.28)' },
  { label: '노트북', value: '노트북', icon: SlidersHorizontal, activeColor: '#3a6b9a', activeShadow: 'rgba(58,107,154,0.28)' },
  { label: '반려동물', value: '반려동물', icon: PawPrint, activeColor: '#4a8a4a', activeShadow: 'rgba(74,138,74,0.28)' },
]

export default function Sidebar({
  cafes,
  filters,
  onFilterChange,
  searchQuery,
  onSearchChange,
  selectedCafe,
  distanceOrigin,
  onCafeSelect,
  activeQuickCategory,
  onQuickCategoryChange,
  onClearSelection,
  onReportNewPlace,
  favoriteCafeIds,
  onFavoriteToggle,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const panel = (
    <aside className="flex h-full w-full flex-col overflow-hidden rounded-none border-[#eee4d8] bg-[#fbf8f3] shadow-[0_24px_70px_rgba(58,38,18,0.18)] md:rounded-[22px] md:border">
      <div className="shrink-0 px-4 pb-3 pt-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/home" className="flex min-w-0 items-center gap-2.5 no-underline">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_8px_18px_rgba(90,46,17,0.18)]">
              <Image
                src="/image/logo/beenRoad.png"
                alt="원두로 로고"
                width={40}
                height={40}
                className="h-full w-full object-cover"
                priority
              />
            </span>
            <span className="min-w-0 truncate text-lg font-black tracking-tight text-[#7b3c0f]">
              원두로
            </span>
          </Link>

          <div className="flex items-center gap-1 rounded-full bg-white px-1 py-1 shadow-sm">
            <ThemeToggle />
            <button
              type="button"
              className="hidden h-8 w-8 items-center justify-center rounded-full text-[#7d6149] md:flex"
              aria-label="알림"
            >
              <Bell size={16} />
            </button>
            {onMobileClose && (
              <button
                type="button"
                onClick={onMobileClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#7d6149] md:hidden"
                aria-label="목록 닫기"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>

        <nav className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-white/70 p-1">
          <Link
            href="/map"
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#5a2e11] text-sm font-black text-white no-underline shadow-sm"
          >
            <Map size={17} />
            지도
          </Link>
          <Link
            href="/cbti"
            className="flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-black text-[#4b3527] no-underline transition-colors hover:bg-white"
          >
            <Brain size={17} />
            CBTI
          </Link>
        </nav>

        <div className="mt-3">
          <SearchBar value={searchQuery} onChange={onSearchChange} resultCount={cafes.length} />
        </div>
      </div>

      <div className="shrink-0 border-y border-[#eee4d8] bg-[#fbf8f3] px-4 py-3">
        <div className="grid grid-cols-3 gap-2">
          {QUICK_CATEGORIES.map(({ label, value, icon: Icon, activeColor, activeShadow }) => {
            const active = activeQuickCategory === value
            return (
              <button
                key={label}
                type="button"
                onClick={() => onQuickCategoryChange(value)}
                aria-pressed={active}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3 text-[11px] font-black transition-all"
                style={active
                  ? { background: activeColor, borderColor: activeColor, color: 'white', boxShadow: `0 6px 14px ${activeShadow}` }
                  : { background: 'white', borderColor: '#eadfd3', color: '#5f4634' }
                }
              >
                <Icon size={16} />
                {label}
              </button>
            )
          })}
        </div>

        <div className="mt-3">
          <FilterBar filters={filters} onChange={onFilterChange} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-black text-[#2c2118]">추천 카페</h2>
          <button
            type="button"
            onClick={onClearSelection}
            className="flex h-8 items-center gap-1.5 rounded-full border border-[#eadfd3] bg-white px-3 text-xs font-black text-[#755b45]"
          >
            <SlidersHorizontal size={13} />
            추천순
          </button>
        </div>

        <div className="space-y-2.5">
          {cafes.map((cafe) => (
            <CafeListItem
              key={cafe.id}
              cafe={cafe}
              selected={selectedCafe?.id === cafe.id}
              distanceOrigin={distanceOrigin}
              onSelect={onCafeSelect}
              favorite={favoriteCafeIds.has(cafe.id)}
              onFavoriteToggle={onFavoriteToggle}
            />
          ))}
          {cafes.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#dacdbf] bg-white p-6 text-center text-sm font-semibold text-[#8b7a68]">
              <p>조건에 맞는 카페가 없습니다.</p>
              <button
                type="button"
                onClick={onReportNewPlace}
                className="mt-4 h-10 rounded-xl bg-[#d66612] px-4 text-sm font-black text-white"
              >
                새 카페 제보하기
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-[#eee4d8] bg-white/80 px-4 py-3">
        <Link
          href="/home"
          className="flex h-10 items-center justify-center gap-2 rounded-2xl border border-[#eadfd3] bg-white text-sm font-black text-[#5a2e11] no-underline transition-colors hover:bg-[#fff8ef]"
        >
          <Coffee size={16} />
          원두로 홈
        </Link>
      </div>
    </aside>
  )

  return (
    <>
      <div className="hidden h-dvh w-[386px] shrink-0 p-3 md:block">{panel}</div>
      <div
        className={`fixed inset-0 z-40 bg-black/35 transition-opacity md:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onMobileClose}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 h-[86dvh] transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {panel}
      </div>
    </>
  )
}
