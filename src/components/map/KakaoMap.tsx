'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { Cafe } from '@/types/cafe'

interface KakaoMapProps {
  cafes: Cafe[]
  onCafeSelect: (cafe: Cafe | null) => void
}

const ANSAN_CENTER = { lat: 37.3084, lng: 126.8419 }

export default function KakaoMap({ cafes, onCafeSelect }: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const markersRef = useRef<Map<string, kakao.maps.Marker>>(new Map())
  const onSelectRef = useRef(onCafeSelect)
  onSelectRef.current = onCafeSelect

  const cafesRef = useRef(cafes)

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

  // Update markers when filtered cafes change
  useEffect(() => {
    cafesRef.current = cafes
    renderMarkers()
  }, [cafes, renderMarkers])

  // Initialize map once
  useEffect(() => {
    const initMap = () => {
      if (!containerRef.current) return
      kakao.maps.load(() => {
        const center = new kakao.maps.LatLng(ANSAN_CENTER.lat, ANSAN_CENTER.lng)
        mapRef.current = new kakao.maps.Map(containerRef.current!, {
          center,
          level: 6,
        })
        // close preview when clicking the map background
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

  return <div ref={containerRef} className="absolute inset-0" />
}
