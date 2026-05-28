'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Cafe } from '@/types/cafe'

export type SelectionSource = 'sidebar' | 'map-marker' | 'carousel' | 'direct' | null

export interface MapSelectionResult {
  selectedCafe: Cafe | null
  selectedFrom: SelectionSource
  selectCafe: (cafe: Cafe, from: SelectionSource) => void
  clearSelection: () => void
}

export function useMapSelection(allCafes: Cafe[]): MapSelectionResult {
  const searchParams = useSearchParams()
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)
  const [selectedFrom, setSelectedFrom] = useState<SelectionSource>(null)
  const initialCafeQueryHandledRef = useRef<string | null>(null)

  useEffect(() => {
    const cafeId = searchParams.get('cafe')
    if (!cafeId || initialCafeQueryHandledRef.current === cafeId) return

    const cafe = allCafes.find((item) => item.id === cafeId)
    if (!cafe) return

    initialCafeQueryHandledRef.current = cafeId
    const timeoutId = window.setTimeout(() => {
      setSelectedCafe(cafe)
      setSelectedFrom('direct')
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [allCafes, searchParams])

  const selectCafe = useCallback((cafe: Cafe, from: SelectionSource) => {
    setSelectedCafe(cafe)
    setSelectedFrom(from)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedCafe(null)
    setSelectedFrom(null)
  }, [])

  return { selectedCafe, selectedFrom, selectCafe, clearSelection }
}
