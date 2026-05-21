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
  { label: '전체', value: null, icon: Sparkles },
  { label: '스페셜티', value: '스페셜티', icon: Coffee },
  { label: '로스터리', value: '로스터리', icon: CupSoda },
  { label: '디저트', value: '디저트', icon: BookOpen },
  { label: '노트북', value: '노트북', icon: SlidersHorizontal },
  { label: '반려동물', value: '반려동물', icon: PawPrint },
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
          <Link href="/" className="flex min-w-0 items-center gap-2.5 no-underline">
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

      <div className="shrink-0 border-y border-[#eee4d8] bg-[#fbf8f3] py-3">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-gradient-to-r from-[#fbf8f3] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-4 bg-gradient-to-l from-[#fbf8f3] to-transparent" />
          <div className="overflow-x-auto scrollbar-hide px-4 pb-1">
            <div className="flex items-center gap-1.5">
              {QUICK_CATEGORIES.map(({ label, value, icon: Icon }, index) => {
                const active = activeQuickCategory === value
                const isFirst = index === 0
                return (
                  <div key={label} className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onQuickCategoryChange(value)}
                      aria-pressed={active}
                      className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-black transition-all ${
                        active
                          ? 'border-[#5a2e11] bg-[#5a2e11] text-white shadow-[0_6px_14px_rgba(90,46,17,0.25)]'
                          : 'border-[#eadfd3] bg-white text-[#5f4634] hover:border-[#d9b18a] hover:bg-[#fff8ef]'
                      }`}
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                    {isFirst && <span aria-hidden className="h-5 w-px shrink-0 bg-[#eadfd3]" />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-3 px-4">
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
          href="/beans"
          className="flex h-10 items-center justify-center gap-2 rounded-2xl border border-[#eadfd3] bg-white text-sm font-black text-[#5a2e11] no-underline transition-colors hover:bg-[#fff8ef]"
        >
          <Coffee size={16} />
          내 주변 카페 더보기
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
