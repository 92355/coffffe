import cafesData from '@/data/cafes.json'
import type { Cafe } from '@/types/cafe'
import MapView from '@/components/MapView'
import ThemeToggle from '@/components/ThemeToggle'

export default function HomePage() {
  const cafes = cafesData as Cafe[]

  return (
    <div className="flex flex-col h-dvh">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold tracking-tight text-gray-900 dark:text-gray-100">
            co<span className="text-amber-700 dark:text-amber-500">FFFFF</span>e map
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">안산 스페셜티 커피</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Map fills remaining height */}
      <MapView allCafes={cafes} />
    </div>
  )
}
