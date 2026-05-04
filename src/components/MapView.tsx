'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { Cafe, FilterState } from '@/types/cafe'
import FilterBar from '@/components/FilterBar'
import CafePreviewCard from '@/components/CafePreviewCard'

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

  const filteredCafes = useMemo(() => {
    return allCafes.filter(cafe => {
      if (filters.roastLevel && !cafe.roastLevels.includes(filters.roastLevel)) return false
      if (filters.beanOrigin && !cafe.beanOrigins.includes(filters.beanOrigin)) return false
      if (filters.brewMethod && !cafe.brewMethods.includes(filters.brewMethod)) return false
      return true
    })
  }, [allCafes, filters])

  return (
    <>
      <div className="shrink-0 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      <div className="relative flex-1 min-h-0">
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className="rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
            {filteredCafes.length}곳
          </span>
        </div>

        <KakaoMap cafes={filteredCafes} onCafeSelect={setSelectedCafe} />

        <CafePreviewCard cafe={selectedCafe} onClose={() => setSelectedCafe(null)} />
      </div>
    </>
  )
}
