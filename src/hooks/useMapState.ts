import { useCallback, useState } from 'react'
import type { MapBounds, MapType, ZoomRequest } from '@/components/map/KakaoMap'

export interface MapStateResult {
  mapType: MapType
  zoomRequest: ZoomRequest | null
  /** 현재 뷰포트 경계 — 지도를 이동할 때마다 갱신 */
  currentMapBounds: MapBounds | null
  /** "현재 지도에서 검색" 버튼을 눌러 실제 적용된 경계 */
  activeMapBounds: MapBounds | null
  hasPendingBoundsSearch: boolean
  mapPickMode: boolean
  setMapPickMode: (active: boolean) => void
  handleZoom: (direction: ZoomRequest['direction']) => void
  handleMapTypeToggle: () => void
  handleMapBoundsChange: (bounds: MapBounds) => void
  /** bounds가 적용될 때 추가 처리가 필요하면 onApply로 전달 */
  handleSearchCurrentMap: (onApply?: (bounds: MapBounds) => void) => void
}

export function useMapState(): MapStateResult {
  const [mapType, setMapType] = useState<MapType>('normal')
  const [zoomRequest, setZoomRequest] = useState<ZoomRequest | null>(null)
  const [currentMapBounds, setCurrentMapBounds] = useState<MapBounds | null>(null)
  const [activeMapBounds, setActiveMapBounds] = useState<MapBounds | null>(null)
  const [hasPendingBoundsSearch, setHasPendingBoundsSearch] = useState(false)
  const [mapPickMode, setMapPickMode] = useState(false)

  const handleZoom = useCallback((direction: ZoomRequest['direction']) => {
    setZoomRequest((current) => ({
      id: (current?.id ?? 0) + 1,
      direction,
    }))
  }, [])

  const handleMapTypeToggle = useCallback(() => {
    setMapType((current) => current === 'normal' ? 'skyview' : 'normal')
  }, [])

  // 첫 bounds 변경(초기 로드)에서는 pending 표시를 하지 않는다
  const handleMapBoundsChange = useCallback((bounds: MapBounds) => {
    setCurrentMapBounds((prev) => {
      setHasPendingBoundsSearch(prev !== null)
      return bounds
    })
  }, [])

  const handleSearchCurrentMap = useCallback((onApply?: (bounds: MapBounds) => void) => {
    setCurrentMapBounds((bounds) => {
      if (!bounds) return bounds
      setActiveMapBounds(bounds)
      setHasPendingBoundsSearch(false)
      onApply?.(bounds)
      return bounds
    })
  }, [])

  return {
    mapType,
    zoomRequest,
    currentMapBounds,
    activeMapBounds,
    hasPendingBoundsSearch,
    mapPickMode,
    setMapPickMode,
    handleZoom,
    handleMapTypeToggle,
    handleMapBoundsChange,
    handleSearchCurrentMap,
  }
}
