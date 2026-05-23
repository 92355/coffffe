'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'

const KAKAO_MAP_READY_EVENT = 'kakaoMapReady'

const ANSAN_CENTER = { lat: 37.3084, lng: 126.8419 }
const INITIAL_MAP_LEVEL = 6

/**
 * Kakao Maps SDK 로드를 대기하고 지도 인스턴스를 생성해 onReady 콜백으로 전달한다.
 * 이벤트 이름 'kakaoMapReady'는 이 훅 내부에만 존재한다.
 */
export function useKakaoMap(
  containerRef: RefObject<HTMLDivElement | null>,
  onReady: (map: kakao.maps.Map) => void,
): void {
  const onReadyRef = useRef(onReady)
  useLayoutEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return

    const init = () => {
      if (!containerRef.current) return
      kakao.maps.load(() => {
        if (initializedRef.current) return
        initializedRef.current = true

        const center = new kakao.maps.LatLng(ANSAN_CENTER.lat, ANSAN_CENTER.lng)
        const map = new kakao.maps.Map(containerRef.current!, {
          center,
          level: INITIAL_MAP_LEVEL,
        })
        onReadyRef.current(map)
      })
    }

    if (window.kakao?.maps) {
      init()
    } else {
      window.addEventListener(KAKAO_MAP_READY_EVENT, init, { once: true })
      return () => window.removeEventListener(KAKAO_MAP_READY_EVENT, init)
    }
  }, [containerRef])
}
