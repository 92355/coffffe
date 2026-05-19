'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { Cafe } from '@/types/cafe'

interface KakaoMapProps {
  cafes: Cafe[]
  selectedCafe?: Cafe | null
  onCafeSelect: (cafe: Cafe | null) => void
}

const ANSAN_CENTER = { lat: 37.3084, lng: 126.8419 }
const DEFAULT_MARKER_SIZE = 40
const SELECTED_MARKER_SIZE = 52

export default function KakaoMap({ cafes, selectedCafe, onCafeSelect }: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const overlaysRef = useRef<Map<string, kakao.maps.CustomOverlay>>(new Map())
  const onSelectRef = useRef(onCafeSelect)

  const cafesRef = useRef(cafes)

  useEffect(() => {
    onSelectRef.current = onCafeSelect
  }, [onCafeSelect])

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

    const position = new kakao.maps.LatLng(selectedCafe.lat, selectedCafe.lng)
    map.panTo(position)
  }, [selectedCafe])

  // Initialize map once / 지도는 최초 1회만 초기화한다.
  useEffect(() => {
    const initMap = () => {
      if (!containerRef.current) return
      kakao.maps.load(() => {
        const center = new kakao.maps.LatLng(ANSAN_CENTER.lat, ANSAN_CENTER.lng)
        mapRef.current = new kakao.maps.Map(containerRef.current!, {
          center,
          level: 6,
        })
        // Close preview when clicking map background / 지도 배경 클릭 시 선택을 해제한다.
        kakao.maps.event.addListener(mapRef.current, 'click', () => {
          onSelectRef.current(null)
        })
        renderMarkers()
      })
    }

    if (window.kakao?.maps) {
      initMap()
    } else {
      window.addEventListener('kakaoMapReady', initMap, { once: true })
      return () => window.removeEventListener('kakaoMapReady', initMap)
    }
  }, [renderMarkers])

  return <div ref={containerRef} className="absolute inset-0 bg-neutral-900" />
}

function createMarkerContent(cafe: Cafe, selected: boolean, onClick: () => void): HTMLElement {
  const markerSize = selected ? SELECTED_MARKER_SIZE : DEFAULT_MARKER_SIZE
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
    'flex items-center justify-center rounded-full border-2 text-white shadow-[0_10px_24px_rgba(73,39,15,0.28)]',
    selected ? 'border-white bg-[#d66612]' : 'border-[#f4dec8] bg-[#5a2e11]',
  ].join(' ')
  pin.style.width = `${markerSize}px`
  pin.style.height = `${markerSize}px`

  const cup = document.createElement('span')
  cup.className = 'block h-[14px] w-[18px] rounded-b-full rounded-t-sm border-2 border-current'
  pin.append(cup)
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
    event.stopPropagation()
    onClick()
  })

  return root
}
