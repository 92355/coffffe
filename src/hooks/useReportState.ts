import { useCallback, useState } from 'react'
import type { Cafe } from '@/types/cafe'
import type { LocationPoint } from '@/types/location'
import type { ReportType } from '@/types/report'

export interface ReportStateResult {
  reportSheetOpen: boolean
  reportInitialType: ReportType
  reportInitialCafe: Cafe | null
  reportInitialLocation: LocationPoint | null
  setReportSheetOpen: (open: boolean) => void
  openNewPlaceReport: () => void
  openCafeReport: (cafe: Cafe) => void
  handleStartMapPick: () => void
  handleMapPickComplete: (location: LocationPoint) => void
}

export function useReportState(
  setMapPickMode: (active: boolean) => void,
  mapPickMode: boolean,
): ReportStateResult {
  const [reportSheetOpen, setReportSheetOpen] = useState(false)
  const [reportInitialType, setReportInitialType] = useState<ReportType>('new_place')
  const [reportInitialCafe, setReportInitialCafe] = useState<Cafe | null>(null)
  const [reportInitialLocation, setReportInitialLocation] = useState<LocationPoint | null>(null)

  const openNewPlaceReport = useCallback(() => {
    setReportInitialType('new_place')
    setReportInitialCafe(null)
    setReportInitialLocation(null)
    setReportSheetOpen(true)
  }, [])

  const openCafeReport = useCallback((cafe: Cafe) => {
    setReportInitialType('correction')
    setReportInitialCafe(cafe)
    setReportInitialLocation(null)
    setReportSheetOpen(true)
  }, [])

  const handleStartMapPick = useCallback(() => {
    setReportSheetOpen(false)
    setMapPickMode(true)
  }, [setMapPickMode])

  const handleMapPickComplete = useCallback((location: LocationPoint) => {
    if (!mapPickMode) return
    setReportInitialType('new_place')
    setReportInitialCafe(null)
    setReportInitialLocation(location)
    setReportSheetOpen(true)
    setMapPickMode(false)
  }, [mapPickMode, setMapPickMode])

  return {
    reportSheetOpen,
    reportInitialType,
    reportInitialCafe,
    reportInitialLocation,
    setReportSheetOpen,
    openNewPlaceReport,
    openCafeReport,
    handleStartMapPick,
    handleMapPickComplete,
  }
}
