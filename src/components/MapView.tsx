'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Brain, Coffee } from 'lucide-react'
import type { Cafe, FilterState } from '@/types/cafe'
import BottomSheet from '@/components/BottomSheet'
import SearchBar from '@/components/SearchBar'
import Sidebar from '@/components/Sidebar'
import ThemeToggle from '@/components/ThemeToggle'

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
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCafes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return allCafes.filter(cafe => {
      if (filters.roastLevel && !cafe.roastLevels.includes(filters.roastLevel)) return false
      if (filters.beanOrigin && !cafe.beanOrigins.includes(filters.beanOrigin)) return false
      if (filters.brewMethod && !cafe.brewMethods.includes(filters.brewMethod)) return false
      if (normalizedQuery) {
        const searchTarget = `${cafe.name} ${cafe.shortDescription} ${cafe.address} ${cafe.tags.join(' ')}`.toLowerCase()
        if (!searchTarget.includes(normalizedQuery)) return false
      }
      return true
    })
  }, [allCafes, filters, searchQuery])

  const visibleSelectedCafe = selectedCafe && filteredCafes.some(cafe => cafe.id === selectedCafe.id)
    ? selectedCafe
    : null

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-neutral-950">
      <Sidebar
        cafes={filteredCafes}
        filters={filters}
        onFilterChange={setFilters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCafe={visibleSelectedCafe}
        onCafeSelect={setSelectedCafe}
        onClearSelection={() => setSelectedCafe(null)}
      />

      <div className="relative min-w-0 flex-1">
        <KakaoMap cafes={filteredCafes} selectedCafe={visibleSelectedCafe} onCafeSelect={setSelectedCafe} />

        <div className="pointer-events-none absolute inset-x-4 top-4 z-20 space-y-2 md:hidden">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            resultCount={filteredCafes.length}
            className="pointer-events-auto"
          />
          <div className="pointer-events-auto flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <Link
                href="/beans"
                className="flex h-10 items-center gap-1.5 rounded-full border border-white/15 bg-neutral-950/75 px-3 text-xs font-bold text-white no-underline shadow-lg backdrop-blur"
              >
                <Coffee size={14} />
                원두
              </Link>
              <Link
                href="/cbti"
                className="flex h-10 items-center gap-1.5 rounded-full border border-white/15 bg-neutral-950/75 px-3 text-xs font-bold text-white no-underline shadow-lg backdrop-blur"
              >
                <Brain size={14} />
                CBTI
              </Link>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-4 right-4 z-20 hidden md:block">
          <span className="rounded-full border border-white/15 bg-neutral-950/80 px-4 py-2 text-xs font-bold text-white shadow-xl backdrop-blur">
            {filteredCafes.length}곳 표시 중
          </span>
        </div>

        <BottomSheet cafe={visibleSelectedCafe} onClose={() => setSelectedCafe(null)} />
      </div>
    </div>
  )
}
