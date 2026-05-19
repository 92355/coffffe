'use client'

import Link from 'next/link'
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
  onCafeSelect: (cafe: Cafe) => void
  activeQuickCategory: string | null
  onQuickCategoryChange: (value: string | null) => void
  onClearSelection: () => void
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
  onCafeSelect,
  activeQuickCategory,
  onQuickCategoryChange,
  onClearSelection,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const panel = (
    <aside className="flex h-full w-full flex-col overflow-hidden rounded-none border-[#eee4d8] bg-[#fbf8f3] shadow-[0_24px_70px_rgba(58,38,18,0.18)] md:rounded-[22px] md:border">
      <div className="shrink-0 px-4 pb-3 pt-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-3 no-underline">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#5a2e11] text-white shadow-[0_10px_24px_rgba(90,46,17,0.26)]">
              <Coffee size={22} fill="currentColor" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xl font-black tracking-tight text-[#7b3c0f]">
                coFFFFFe map
              </span>
              <span className="block truncate text-xs font-bold text-[#9b8a78]">당신의 스페셜티 커피 지도</span>
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
            href="/"
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
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_CATEGORIES.map(({ label, value, icon: Icon }) => {
            const active = activeQuickCategory === value
            return (
              <button
                key={label}
                type="button"
                onClick={() => onQuickCategoryChange(value)}
                className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-black transition-all ${
                  active
                    ? 'border-[#d66612] bg-[#d66612] text-white'
                    : 'border-[#eadfd3] bg-white text-[#5f4634] hover:border-[#d9b18a]'
                }`}
              >
                <Icon size={13} />
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
              onSelect={onCafeSelect}
            />
          ))}
          {cafes.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#dacdbf] bg-white p-6 text-center text-sm font-semibold text-[#8b7a68]">
              조건에 맞는 카페가 없습니다.
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
