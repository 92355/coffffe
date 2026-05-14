'use client'

import { useEffect, useState } from 'react'
import cafesData from '@/data/cafes.json'
import type { Cafe } from '@/types/cafe'
import MapView from '@/components/MapView'
import SplashScreen from '@/components/SplashScreen'

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(false)
  const cafes = cafesData as Cafe[]

  useEffect(() => {
    const splashTimer = window.setTimeout(() => {
      if (!sessionStorage.getItem('cofffe-splash-seen')) {
        setShowSplash(true)
      }
    }, 0)

    return () => window.clearTimeout(splashTimer)
  }, [])

  function handleSplashDone() {
    sessionStorage.setItem('cofffe-splash-seen', '1')
    setShowSplash(false)
  }

  return (
    <main className="relative h-dvh overflow-hidden bg-neutral-950">
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      <MapView allCafes={cafes} />
    </main>
  )
}
