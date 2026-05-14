'use client'

import Link from 'next/link'
import { Brain, Coffee, MapPin, X } from 'lucide-react'
import type { Cafe, FilterState } from '@/types/cafe'
import CafeListItem from '@/components/CafeListItem'
import CafePreviewCard from '@/components/CafePreviewCard'
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
  onClearSelection: () => void
}

export default function Sidebar({
  cafes,
  filters,
  onFilterChange,
  searchQuery,
  onSearchChange,
  selectedCafe,
  onCafeSelect,
  onClearSelection,
}: SidebarProps) {
  return (
    <aside className="hidden h-dvh w-[390px] shrink-0 flex-col border-r border-neutral-200 bg-[#f7f1e8]/95 shadow-2xl shadow-black/15 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/95 md:flex">
      <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-3 no-underline">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-700 text-white shadow-lg shadow-amber-900/20 dark:bg-amber-500 dark:text-neutral-950">
              <MapPin size={19} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-black text-neutral-950 dark:text-neutral-50">
                co<span className="text-amber-700 dark:text-amber-400">FFFFF</span>e map
              </span>
              <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">안산 스페셜티 커피</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>

        <nav className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href="/beans"
            className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 no-underline transition-colors hover:border-amber-300 hover:text-amber-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-amber-500 dark:hover:text-amber-300"
          >
            <Coffee size={16} />
            원두
          </Link>
          <Link
            href="/cbti"
            className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 no-underline transition-colors hover:border-amber-300 hover:text-amber-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-amber-500 dark:hover:text-amber-300"
          >
            <Brain size={16} />
            CBTI
          </Link>
        </nav>
      </div>

      <div className="space-y-3 border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
        <SearchBar value={searchQuery} onChange={onSearchChange} resultCount={cafes.length} />
        <FilterBar filters={filters} onChange={onFilterChange} layout="stack" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {selectedCafe && (
          <section className="mb-4 rounded-3xl border border-amber-400/60 bg-white p-4 shadow-lg shadow-amber-900/10 dark:border-amber-500/50 dark:bg-neutral-900">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">Selected</p>
              <button
                type="button"
                onClick={onClearSelection}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300"
                aria-label="선택 해제"
              >
                <X size={15} />
              </button>
            </div>
            <CafePreviewCard cafe={selectedCafe} />
          </section>
        )}

        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="text-sm font-black text-neutral-950 dark:text-neutral-50">카페 리스트</h2>
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{cafes.length}곳</span>
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
            <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              조건에 맞는 카페가 없습니다.
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
