'use client'

import { useEffect, useRef } from 'react'
import { fetchWithIdentity } from '@/lib/fetchWithIdentity'
import { hasTrackedView, markViewTracked } from '@/lib/sessionViewCache'

/**
 * Fire a single POST /views per session per cafe.
 * 같은 카페에 대해 세션 내 중복 호출은 차단된다.
 * Strict Mode 더블 mount에서도 1회만 발생하도록 ref 가드 추가.
 */
export function useViewTracker(cafeId: string | null | undefined): void {
  const lastFiredRef = useRef<string | null>(null)

  useEffect(() => {
    if (!cafeId) return

    if (lastFiredRef.current === cafeId) return
    if (hasTrackedView(cafeId)) {
      lastFiredRef.current = cafeId
      return
    }

    lastFiredRef.current = cafeId
    markViewTracked(cafeId)

    const abortController = new AbortController()

    fetchWithIdentity(`/api/cafes/${encodeURIComponent(cafeId)}/views`, {
      method: 'POST',
      signal: abortController.signal,
    }).catch((error) => {
      if (abortController.signal.aborted) return
      console.warn('Failed to track cafe view. / 카페 조회수 트래킹 실패.', error)
    })

    return () => {
      abortController.abort()
    }
  }, [cafeId])
}
