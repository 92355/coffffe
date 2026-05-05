import cafesData from '@/data/cafes.json'
import type { Cafe } from '@/types/cafe'
import MapView from '@/components/MapView'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'

export default function MapPage() {
  const cafes = cafesData as Cafe[]

  return (
    <div className="flex flex-col h-dvh">
      <header className="flex items-center justify-between px-4 h-14 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center justify-center w-8 h-8 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="뒤로 가기"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <Link href="/" className="flex items-baseline gap-2 no-underline">
            <span className="text-base font-bold tracking-tight text-gray-900 dark:text-gray-100">
              co<span className="text-amber-700 dark:text-amber-500">FFFFF</span>e map
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">안산 스페셜티 커피</span>
          </Link>
        </div>
        <ThemeToggle />
      </header>

      <MapView allCafes={cafes} />
    </div>
  )
}
