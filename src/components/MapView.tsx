'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Bell, ChevronDown, Layers, List, LocateFixed, Minus, Plus, Search, UserRound } from 'lucide-react'
import type { Cafe, FilterState } from '@/types/cafe'
import BottomSheet from '@/components/BottomSheet'
import Sidebar from '@/components/Sidebar'

const KakaoMap = dynamic(() => import('@/components/map/KakaoMap'), { ssr: false })

interface MapViewProps {
  allCafes: Cafe[]
}

const INITIAL_FILTERS: FilterState = {
  roastLevel: null,
  beanOrigin: null,
  brewMethod: null,
}

export default function MapView({ allCafes }: MapViewProps) {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(allCafes[0] ?? null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeQuickCategory, setActiveQuickCategory] = useState<string | null>(null)
  const [mobileListOpen, setMobileListOpen] = useState(false)
  const [locationRequestId, setLocationRequestId] = useState(0)

  const filteredCafes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const normalizedCategory = activeQuickCategory?.trim().toLowerCase() ?? ''

    return allCafes.filter(cafe => {
      if (filters.roastLevel && !cafe.roastLevels.includes(filters.roastLevel)) return false
      if (filters.beanOrigin && !cafe.beanOrigins.includes(filters.beanOrigin)) return false
      if (filters.brewMethod && !cafe.brewMethods.includes(filters.brewMethod)) return false

      const searchTarget = `${cafe.name} ${cafe.shortDescription} ${cafe.fullDescription} ${cafe.address} ${cafe.tags.join(' ')}`.toLowerCase()
      if (normalizedQuery && !searchTarget.includes(normalizedQuery)) return false
      if (normalizedCategory && !searchTarget.includes(normalizedCategory)) return false

      return true
    })
  }, [activeQuickCategory, allCafes, filters, searchQuery])

  const visibleSelectedCafe = selectedCafe && filteredCafes.some(cafe => cafe.id === selectedCafe.id)
    ? selectedCafe
    : null

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#f3eee7]">
      <Sidebar
        cafes={filteredCafes}
        filters={filters}
        onFilterChange={setFilters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCafe={visibleSelectedCafe}
        onCafeSelect={(cafe) => {
          setSelectedCafe(cafe)
          setMobileListOpen(false)
        }}
        activeQuickCategory={activeQuickCategory}
        onQuickCategoryChange={setActiveQuickCategory}
        onClearSelection={() => setSelectedCafe(null)}
        mobileOpen={mobileListOpen}
        onMobileClose={() => setMobileListOpen(false)}
      />

      <div className="relative min-w-0 flex-1 overflow-hidden">
        <KakaoMap
          cafes={filteredCafes}
          selectedCafe={visibleSelectedCafe}
          onCafeSelect={setSelectedCafe}
          locationRequestId={locationRequestId}
        />

        <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center px-4">
          <button
            type="button"
            className="pointer-events-auto flex h-10 items-center gap-2 rounded-full border border-[#eee4d8] bg-white px-4 text-sm font-black text-[#6f3b17] shadow-[0_12px_28px_rgba(60,40,20,0.12)]"
          >
            <Search size={15} />
            이 지역 검색
          </button>
        </div>

        <div className="pointer-events-none absolute right-4 top-4 z-20 hidden items-center gap-2 md:flex">
          <button
            type="button"
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#eee4d8] bg-white text-[#6f3b17] shadow-[0_12px_28px_rgba(60,40,20,0.12)]"
            aria-label="알림"
          >
            <Bell size={18} />
          </button>
          <button
            type="button"
            className="pointer-events-auto flex h-11 items-center gap-2 rounded-full border border-[#eee4d8] bg-white py-1 pl-1.5 pr-3 text-[#6f3b17] shadow-[0_12px_28px_rgba(60,40,20,0.12)]"
            aria-label="프로필"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2d8c1]">
              <UserRound size={16} />
            </span>
            <ChevronDown size={14} />
          </button>
        </div>

        <div className="pointer-events-none absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 md:flex">
          <div className="pointer-events-auto overflow-hidden rounded-2xl border border-[#eee4d8] bg-white shadow-[0_12px_28px_rgba(60,40,20,0.12)]">
            <button type="button" className="flex h-12 w-12 items-center justify-center text-[#6f3b17]" aria-label="확대">
              <Plus size={17} />
            </button>
            <div className="mx-2 h-px bg-[#eee4d8]" />
            <button type="button" className="flex h-12 w-12 items-center justify-center text-[#6f3b17]" aria-label="축소">
              <Minus size={17} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setLocationRequestId((current) => current + 1)}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#eee4d8] bg-white text-[#6f3b17] shadow-[0_12px_28px_rgba(60,40,20,0.12)]"
            aria-label="현재 위치"
          >
            <LocateFixed size={18} />
          </button>
          <button
            type="button"
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#eee4d8] bg-white text-[#6f3b17] shadow-[0_12px_28px_rgba(60,40,20,0.12)]"
            aria-label="지도 레이어"
          >
            <Layers size={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setLocationRequestId((current) => current + 1)}
          className="pointer-events-auto absolute bottom-24 right-4 z-20 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#eee4d8] bg-white text-[#6f3b17] shadow-[0_12px_28px_rgba(60,40,20,0.12)] md:hidden"
          aria-label="현재 위치"
        >
          <LocateFixed size={18} />
        </button>

        <div className="pointer-events-none absolute inset-x-4 bottom-5 z-20 flex items-center justify-between gap-3">
          <div className="pointer-events-auto hidden h-12 items-center gap-2 rounded-full border border-[#eee4d8] bg-white px-5 text-sm font-black text-[#6f3b17] shadow-[0_12px_28px_rgba(60,40,20,0.12)] md:flex">
            <CoffeeDot />
            {filteredCafes.length}곳의 카페 발견
          </div>
          <button
            type="button"
            onClick={() => setMobileListOpen(true)}
            className="pointer-events-auto ml-auto flex h-12 items-center gap-2 rounded-full bg-[#d66612] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(150,72,14,0.28)] md:hidden"
          >
            <List size={18} />
            목록 보기
          </button>
          <button
            type="button"
            onClick={() => setMobileListOpen(true)}
            className="pointer-events-auto ml-auto hidden h-12 items-center gap-2 rounded-full bg-[#d66612] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(150,72,14,0.28)] md:flex"
          >
            <List size={18} />
            목록 보기
          </button>
        </div>

        <BottomSheet cafe={visibleSelectedCafe} onClose={() => setSelectedCafe(null)} />
      </div>
    </div>
  )
}

function CoffeeDot() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5a2e11] text-white">
      <span className="h-2.5 w-3.5 rounded-b-full rounded-t-sm border border-current" />
    </span>
  )
}
