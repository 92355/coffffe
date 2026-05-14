'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { Cafe } from '@/types/cafe'

interface KakaoMapProps {
  cafes: Cafe[]
  selectedCafe?: Cafe | null
  onCafeSelect: (cafe: Cafe | null) => void
}

const ANSAN_CENTER = { lat: 37.3084, lng: 126.8419 }

export default function KakaoMap({ cafes, selectedCafe, onCafeSelect }: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const markersRef = useRef<Map<string, kakao.maps.Marker>>(new Map())
  const onSelectRef = useRef(onCafeSelect)

  const cafesRef = useRef(cafes)

  useEffect(() => {
    onSelectRef.current = onCafeSelect
  }, [onCafeSelect])

  const renderMarkers = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current.clear()

    cafesRef.current.forEach(cafe => {
      const pos = new kakao.maps.LatLng(cafe.lat, cafe.lng)
      const marker = new kakao.maps.Marker({ position: pos, map })
      kakao.maps.event.addListener(marker, 'click', () => {
        onSelectRef.current(cafe)
      })
      markersRef.current.set(cafe.id, marker)
    })
  }, [])

  // Update markers when filtered cafes change / 필터 변경 시 마커를 갱신한다.
  useEffect(() => {
    cafesRef.current = cafes
    renderMarkers()
  }, [cafes, renderMarkers])

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
