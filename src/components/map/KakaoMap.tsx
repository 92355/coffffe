'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { MutableRefObject } from 'react'
import type { Cafe } from '@/types/cafe'
import type { LocationPoint } from '@/types/location'

interface KakaoMapProps {
  cafes: Cafe[]
  selectedCafe?: Cafe | null
  onCafeSelect: (cafe: Cafe | null) => void
  onMapBoundsChange?: (bounds: MapBounds) => void
  mapType?: MapType
  zoomRequest?: ZoomRequest | null
  locationRequestId?: number
  onUserLocationChange?: (location: LocationPoint) => void
  onMapClick?: (location: LocationPoint) => void
}

export type MapType = 'normal' | 'skyview'

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface ZoomRequest {
  id: number
  direction: 'in' | 'out'
}

const ANSAN_CENTER = { lat: 37.3084, lng: 126.8419 }
const SELECTED_MAP_LEVEL = 3
const MIN_MAP_LEVEL = 1
const MAX_MAP_LEVEL = 14
const DEFAULT_MARKER_SIZE = 40
const SELECTED_MARKER_SIZE = 52
const GEOLOCATION_TIMEOUT_MS = 10000
const GEOLOCATION_MAXIMUM_AGE_MS = 5000

export default function KakaoMap({
  cafes,
  selectedCafe,
  onCafeSelect,
  onMapBoundsChange,
  mapType = 'normal',
  zoomRequest = null,
  locationRequestId = 0,
  onUserLocationChange,
  onMapClick,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const overlaysRef = useRef<Map<string, kakao.maps.CustomOverlay>>(new Map())
  const userLocationOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null)
  const geolocationWatchIdRef = useRef<number | null>(null)
  const onSelectRef = useRef(onCafeSelect)
  const onBoundsChangeRef = useRef(onMapBoundsChange)
  const onUserLocationChangeRef = useRef(onUserLocationChange)
  const onMapClickRef = useRef(onMapClick)
  const handledZoomRequestIdRef = useRef(0)

  const cafesRef = useRef(cafes)

  useEffect(() => {
    onSelectRef.current = onCafeSelect
  }, [onCafeSelect])

  useEffect(() => {
    onBoundsChangeRef.current = onMapBoundsChange
  }, [onMapBoundsChange])

  useEffect(() => {
    onUserLocationChangeRef.current = onUserLocationChange
  }, [onUserLocationChange])

  useEffect(() => {
    onMapClickRef.current = onMapClick
  }, [onMapClick])

  const renderMarkers = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    overlaysRef.current.forEach((overlay) => overlay.setMap(null))
    overlaysRef.current.clear()

    cafesRef.current.forEach(cafe => {
      const selected = cafe.id === selectedCafe?.id
      const pos = new kakao.maps.LatLng(cafe.lat, cafe.lng)
      const content = createMarkerContent(cafe, selected, () => {
        onSelectRef.current(cafe)
        focusCafeOnMap(map, cafe)
      })
      const overlay = new kakao.maps.CustomOverlay({
        position: pos,
        content,
        map,
        xAnchor: 0.5,
        yAnchor: selected ? 1.08 : 0.95,
        zIndex: selected ? 20 : 10,
      })

      overlaysRef.current.set(cafe.id, overlay)
    })
  }, [selectedCafe?.id])

  // Update markers when filtered cafes change / 필터 변경 시 마커를 갱신한다.
  useEffect(() => {
    cafesRef.current = cafes
    renderMarkers()
  }, [cafes, renderMarkers, selectedCafe])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedCafe) return

    focusCafeOnMap(map, selectedCafe)
  }, [selectedCafe])

  const notifyMapBoundsChange = useCallback((map: kakao.maps.Map | null) => {
    if (!map) return

    const bounds = map.getBounds()
    const northEast = bounds.getNorthEast()
    const southWest = bounds.getSouthWest()

    onBoundsChangeRef.current?.({
      north: northEast.getLat(),
      south: southWest.getLat(),
      east: northEast.getLng(),
      west: southWest.getLng(),
    })
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !zoomRequest || handledZoomRequestIdRef.current === zoomRequest.id) return

    handledZoomRequestIdRef.current = zoomRequest.id
    zoomMap(map, zoomRequest.direction)
  }, [zoomRequest])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    setMapType(map, mapType)
  }, [mapType])

  useEffect(() => {
    const map = mapRef.current
    if (!map || locationRequestId === 0) return

    startWatchingUserLocation(map, userLocationOverlayRef, geolocationWatchIdRef, onUserLocationChangeRef)
  }, [locationRequestId])

  // Initialize map once / 지도는 최초 1회만 초기화한다.
  useEffect(() => {
    if (mapRef.current) return

    const initMap = () => {
      if (!containerRef.current) return
      kakao.maps.load(() => {
        const center = new kakao.maps.LatLng(ANSAN_CENTER.lat, ANSAN_CENTER.lng)
        mapRef.current = new kakao.maps.Map(containerRef.current!, {
          center,
          level: 6,
        })
        // Close preview when clicking map background / 지도 배경 클릭 시 선택을 해제한다.
        kakao.maps.event.addListener(mapRef.current, 'click', (event) => {
          onSelectRef.current(null)
          if (event?.latLng) {
            onMapClickRef.current?.({
              lat: event.latLng.getLat(),
              lng: event.latLng.getLng(),
            })
          }
        })
        kakao.maps.event.addListener(mapRef.current, 'dragend', () => {
          notifyMapBoundsChange(mapRef.current)
        })
        kakao.maps.event.addListener(mapRef.current, 'zoom_changed', () => {
          notifyMapBoundsChange(mapRef.current)
        })
        setMapType(mapRef.current, mapType)
        notifyMapBoundsChange(mapRef.current)
        renderMarkers()
      })
    }

    if (window.kakao?.maps) {
      initMap()
    } else {
      window.addEventListener('kakaoMapReady', initMap, { once: true })
      return () => window.removeEventListener('kakaoMapReady', initMap)
    }
  }, [mapType, notifyMapBoundsChange, renderMarkers])

  useEffect(() => () => {
    if (geolocationWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(geolocationWatchIdRef.current)
    }
  }, [])

  return <div ref={containerRef} className="absolute inset-0 bg-neutral-900" />
}

function focusCafeOnMap(map: kakao.maps.Map, cafe: Cafe): void {
  const position = new kakao.maps.LatLng(cafe.lat, cafe.lng)
  map.setCenter(position)
  map.setLevel(SELECTED_MAP_LEVEL)
}

function zoomMap(map: kakao.maps.Map, direction: ZoomRequest['direction']): void {
  const nextLevel = direction === 'in'
    ? Math.max(MIN_MAP_LEVEL, map.getLevel() - 1)
    : Math.min(MAX_MAP_LEVEL, map.getLevel() + 1)

  map.setLevel(nextLevel, { animate: true })
}

function setMapType(map: kakao.maps.Map, mapType: MapType): void {
  const nextMapTypeId = mapType === 'skyview'
    ? kakao.maps.MapTypeId.SKYVIEW
    : kakao.maps.MapTypeId.ROADMAP

  map.setMapTypeId(nextMapTypeId)
}

function startWatchingUserLocation(
  map: kakao.maps.Map,
  overlayRef: MutableRefObject<kakao.maps.CustomOverlay | null>,
  watchIdRef: MutableRefObject<number | null>,
  onUserLocationChangeRef: MutableRefObject<((location: LocationPoint) => void) | undefined>,
): void {
  if (!navigator.geolocation) {
    console.error('Geolocation is not supported by this browser.')
    return
  }

  if (watchIdRef.current !== null) {
    navigator.geolocation.clearWatch(watchIdRef.current)
  }

  let shouldCenterOnNextPosition = true

  watchIdRef.current = navigator.geolocation.watchPosition(
    (position) => {
      const currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }
      const userPosition = new kakao.maps.LatLng(
        currentLocation.lat,
        currentLocation.lng,
      )

      onUserLocationChangeRef.current?.(currentLocation)
      renderUserLocationOverlay(map, overlayRef, userPosition)

      if (shouldCenterOnNextPosition) {
        map.setLevel(SELECTED_MAP_LEVEL, { anchor: userPosition })
        map.setCenter(userPosition)
        shouldCenterOnNextPosition = false
      }
    },
    (error) => {
      console.error('Failed to watch user location:', error.message)
    },
    {
      enableHighAccuracy: true,
      timeout: GEOLOCATION_TIMEOUT_MS,
      maximumAge: GEOLOCATION_MAXIMUM_AGE_MS,
    },
  )
}

function renderUserLocationOverlay(
  map: kakao.maps.Map,
  overlayRef: MutableRefObject<kakao.maps.CustomOverlay | null>,
  position: kakao.maps.LatLng,
): void {
  overlayRef.current?.setMap(null)

  overlayRef.current = new kakao.maps.CustomOverlay({
    position,
    content: createUserLocationContent(),
    map,
    xAnchor: 0.5,
    yAnchor: 0.5,
    zIndex: 30,
  })
}

function createUserLocationContent(): HTMLElement {
  const root = document.createElement('span')
  root.setAttribute('aria-label', '현재 위치')
  root.className = [
    'block h-5 w-5 rounded-full border-[3px] border-white bg-blue-600',
    'shadow-[0_0_0_8px_rgba(37,99,235,0.18),0_8px_20px_rgba(37,99,235,0.35)]',
  ].join(' ')

  return root
}

function createMarkerContent(cafe: Cafe, selected: boolean, onClick: () => void): HTMLElement {
  const markerSize = selected ? SELECTED_MARKER_SIZE : DEFAULT_MARKER_SIZE
  const imageUrl = cafe.images?.[0]
  const root = document.createElement('button')
  root.type = 'button'
  root.setAttribute('aria-label', `${cafe.name} 선택`)
  root.style.width = `${markerSize}px`
  root.style.minWidth = `${markerSize}px`
  root.className = [
    'group relative flex flex-col items-center border-0 bg-transparent p-0',
    'transition-transform duration-200 hover:scale-105',
    selected ? 'scale-110' : '',
  ].join(' ')

  const pin = document.createElement('span')
  pin.className = [
    'flex items-center justify-center rounded-full border-2 overflow-hidden shadow-[0_10px_24px_rgba(73,39,15,0.28)]',
    selected ? 'border-white bg-[#d66612]' : 'border-[#f4dec8] bg-[#5a2e11]',
  ].join(' ')
  pin.style.width = `${markerSize}px`
  pin.style.height = `${markerSize}px`

  if (imageUrl) {
    const img = document.createElement('img')
    img.src = imageUrl
    img.alt = cafe.name
    img.style.width = '100%'
    img.style.height = '100%'
    img.style.objectFit = 'cover'
    pin.append(img)
  } else {
    const cup = document.createElement('span')
    cup.className = 'block h-[14px] w-[18px] rounded-b-full rounded-t-sm border-2 border-white text-white'
    pin.append(cup)
  }

  // Aroma puffs — render above pin in flex-col order
  const aromaWrap = document.createElement('div')
  aromaWrap.className = 'flex items-center justify-center gap-1'
  aromaWrap.style.height = '16px'
  for (let j = 0; j < 3; j++) {
    const puff = document.createElement('span')
    puff.className = `aroma-puff aroma-puff--${j + 1}${selected ? ' aroma-puff--selected' : ''}`
    aromaWrap.append(puff)
  }
  root.append(aromaWrap)
  root.append(pin)

  if (selected) {
    const label = document.createElement('span')
    label.textContent = cafe.name
    label.className = [
      'absolute top-[58px] max-w-[160px] whitespace-nowrap rounded-full bg-white px-3 py-1',
      'text-xs font-black text-[#5a2e11] shadow-[0_8px_20px_rgba(73,39,15,0.18)]',
    ].join(' ')
    root.append(label)
  }

  // Prevent map background click from clearing selection. / 지도 배경 클릭 해제를 막는다.
  root.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    onClick()
  })

  return root
}
