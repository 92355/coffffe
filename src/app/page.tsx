'use client'

import { useEffect, useState } from 'react'
import type { Cafe } from '@/types/cafe'
import MapView from '@/components/MapView'
import SplashScreen from '@/components/SplashScreen'

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(false)
  const [cafes, setCafes] = useState<Cafe[]>([])
  const [loadingMessage, setLoadingMessage] = useState('카페 정보를 불러오는 중입니다.')

  useEffect(() => {
    const splashTimer = window.setTimeout(() => {
      if (!sessionStorage.getItem('cofffe-splash-seen')) {
        setShowSplash(true)
      }
    }, 0)

    return () => window.clearTimeout(splashTimer)
  }, [])

  useEffect(() => {
    const abortController = new AbortController()

    async function fetchCafes() {
      try {
        const response = await fetch('/api/cafes', {
          signal: abortController.signal,
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error(`Failed to load cafes: ${response.status}`)
        }

        const nextCafes = await response.json() as Cafe[]
        setCafes(nextCafes)
        setLoadingMessage('')
      } catch (error) {
        if (abortController.signal.aborted) return

        console.error(error)
        setLoadingMessage('카페 정보를 불러오지 못했습니다.')
      }
    }

    fetchCafes()

    return () => abortController.abort()
  }, [])

  function handleSplashDone() {
    sessionStorage.setItem('cofffe-splash-seen', '1')
    setShowSplash(false)
  }

  return (
    <main className="relative h-dvh overflow-hidden bg-neutral-950">
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      {loadingMessage ? (
        <div className="flex h-full items-center justify-center bg-[#f3eee7] px-6 text-center text-sm font-bold text-[#6f3b17]">
          {loadingMessage}
        </div>
      ) : (
        <MapView allCafes={cafes} />
      )}
    </main>
  )
}
