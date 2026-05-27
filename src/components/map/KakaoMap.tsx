'use client'

import { useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import type { MutableRefObject } from 'react'
import type { Cafe } from '@/types/cafe'
import type { LocationPoint } from '@/types/location'
import { useKakaoMap } from '@/hooks/useKakaoMap'

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
  const locationRequestIdRef = useRef(locationRequestId)

  // Latest cafes for the map-init callback (before effects can run)
  const cafesRef = useRef(cafes)
  // Track what was last rendered to decide full rebuild vs. partial update
  const prevCafesRef = useRef(cafes)
  const prevSelectedIdRef = useRef<string | null>(selectedCafe?.id ?? null)

  useEffect(() => { locationRequestIdRef.current = locationRequestId }, [locationRequestId])
  useEffect(() => { onSelectRef.current = onCafeSelect }, [onCafeSelect])
  useEffect(() => { onBoundsChangeRef.current = onMapBoundsChange }, [onMapBoundsChange])
  useEffect(() => { onUserLocationChangeRef.current = onUserLocationChange }, [onUserLocationChange])
  useEffect(() => { onMapClickRef.current = onMapClick }, [onMapClick])

  // Full rebuild — stable function (all state accessed via refs or params)
  const renderAll = useCallback((cafeList: Cafe[], selectedId: string | null) => {
    const map = mapRef.current
    if (!map) return
    overlaysRef.current.forEach(o => o.setMap(null))
    overlaysRef.current.clear()
    for (const cafe of cafeList) {
      const sel = cafe.id === selectedId
      overlaysRef.current.set(
        cafe.id,
        makeOverlay(map, cafe, sel, () => {
          onSelectRef.current(cafe)
          focusCafeOnMap(map, cafe)
        }),
      )
    }
  }, [])

  // Stable ref so the map-init callback always calls the latest renderAll
  const renderAllRef = useRef(renderAll)
  useLayoutEffect(() => {
    renderAllRef.current = renderAll
  }, [renderAll])

  // Marker management: full rebuild when cafes list changes, partial update when only selection changes
  useEffect(() => {
    cafesRef.current = cafes  // keep ref in sync for map-init callback

    const map = mapRef.current
    if (!map) return  // map not ready yet; renderAll will be called from useKakaoMap callback

    const cafesChanged = prevCafesRef.current !== cafes
    const prevId = prevSelectedIdRef.current
    const nextId = selectedCafe?.id ?? null

    prevCafesRef.current = cafes
    prevSelectedIdRef.current = nextId

    if (cafesChanged) {
      renderAll(cafes, nextId)
      return
    }

    if (prevId === nextId) return

    // Only two overlays need to change — recreate just those
    if (prevId) {
      const cafe = cafes.find(c => c.id === prevId)
      overlaysRef.current.get(prevId)?.setMap(null)
      overlaysRef.current.delete(prevId)
      if (cafe) {
        overlaysRef.current.set(
          prevId,
          makeOverlay(map, cafe, false, () => {
            onSelectRef.current(cafe)
            focusCafeOnMap(map, cafe)
          }),
        )
      }
    }
    if (nextId) {
      const cafe = cafes.find(c => c.id === nextId)
      overlaysRef.current.get(nextId)?.setMap(null)
      overlaysRef.current.delete(nextId)
      if (cafe) {
        overlaysRef.current.set(
          nextId,
          makeOverlay(map, cafe, true, () => {
            onSelectRef.current(cafe)
            focusCafeOnMap(map, cafe)
          }),
        )
      }
    }
    prevSelectedIdRef.current = nextId
  }, [cafes, selectedCafe, renderAll])

  // Pan/zoom to selected cafe
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

  useKakaoMap(containerRef, (map) => {
    mapRef.current = map
    kakao.maps.event.addListener(map, 'click', (event) => {
      onSelectRef.current(null)
      if (event?.latLng) {
        onMapClickRef.current?.({ lat: event.latLng.getLat(), lng: event.latLng.getLng() })
      }
    })
    kakao.maps.event.addListener(map, 'dragend', () => notifyMapBoundsChange(map))
    kakao.maps.event.addListener(map, 'zoom_changed', () => notifyMapBoundsChange(map))
    setMapType(map, mapType)
    notifyMapBoundsChange(map)
    renderAllRef.current(cafesRef.current, prevSelectedIdRef.current)
    if (locationRequestIdRef.current !== 0) {
      startWatchingUserLocation(map, userLocationOverlayRef, geolocationWatchIdRef, onUserLocationChangeRef)
    }
  })

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

function makeOverlay(
  map: kakao.maps.Map,
  cafe: Cafe,
  selected: boolean,
  onClick: () => void,
): kakao.maps.CustomOverlay {
  return new kakao.maps.CustomOverlay({
    position: new kakao.maps.LatLng(cafe.lat, cafe.lng),
    content: createMarkerContent(cafe, selected, onClick),
    map,
    xAnchor: 0.5,
    yAnchor: selected ? 1.08 : 0.95,
    zIndex: selected ? 20 : 10,
  })
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
      const userPosition = new kakao.maps.LatLng(currentLocation.lat, currentLocation.lng)

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

  root.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    onClick()
  })

  return root
}
