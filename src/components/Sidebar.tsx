'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Coffee,
  CupSoda,
  PawPrint,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import type { Cafe, FilterState } from '@/types/cafe'
import type { LocationPoint } from '@/types/location'
import CafeListItem from '@/components/CafeListItem'
import FilterBar from '@/components/FilterBar'
import ThemeToggle from '@/components/ThemeToggle'

interface SidebarProps {
  cafes: Cafe[]
  filters: FilterState
  onFilterChange: (next: FilterState) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedCafe: Cafe | null
  distanceOrigin: LocationPoint | null
  onCafeSelect: (cafe: Cafe) => void
  activeQuickCategory: string | null
  onQuickCategoryChange: (value: string | null) => void
  onClearSelection: () => void
  onReportNewPlace: () => void
  favoriteCafeIds: Set<string>
  onFavoriteToggle: (cafeId: string) => void
  mobileOpen?: boolean
  onMobileClose?: () => void
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

const QUICK_CATEGORIES = [
  { label: '전체', value: null, icon: Sparkles, activeColor: '#5a2e11', activeShadow: 'rgba(90,46,17,0.25)' },
  { label: '스페셜티', value: '스페셜티', icon: Coffee, activeColor: '#b45a12', activeShadow: 'rgba(180,90,18,0.28)' },
  { label: '로스터리', value: '로스터리', icon: CupSoda, activeColor: '#7c4d2e', activeShadow: 'rgba(124,77,46,0.28)' },
  { label: '디저트', value: '디저트', icon: BookOpen, activeColor: '#c04b6a', activeShadow: 'rgba(192,75,106,0.28)' },
  { label: '노트북', value: '노트북', icon: SlidersHorizontal, activeColor: '#3a6b9a', activeShadow: 'rgba(58,107,154,0.28)' },
  { label: '반려동물', value: '반려동물', icon: PawPrint, activeColor: '#4a8a4a', activeShadow: 'rgba(74,138,74,0.28)' },
]

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

export default function Sidebar({
  cafes,
  filters,
  onFilterChange,
  searchQuery,
  onSearchChange,
  selectedCafe,
  distanceOrigin,
  onCafeSelect,
  activeQuickCategory,
  onQuickCategoryChange,
  onClearSelection,
  onReportNewPlace,
  favoriteCafeIds,
  onFavoriteToggle,
  mobileOpen = false,
  onMobileClose,
  collapsed = false,
  onCollapsedChange,
}: SidebarProps) {
  const [mobileExpanded, setMobileExpanded] = useState(mobileOpen)

  useEffect(() => {
    if (!mobileOpen) return

    const animationFrame = window.requestAnimationFrame(() => {
      setMobileExpanded(true)
    })

    return () => window.cancelAnimationFrame(animationFrame)
  }, [mobileOpen])

  const expandedContent = (
    <>
      <div className="shrink-0 px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <Link href="/home" className="flex shrink-0 items-center no-underline">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(90,46,17,0.12)]">
              <Image
                src="/image/logo/beenRoad.png"
                alt="원두로 로고"
                width={36}
                height={36}
                className="h-full w-full object-cover"
                priority
              />
            </span>
          </Link>
          <label className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl border border-[#eadfd3] bg-white/70 px-3 py-2">
            <Search size={14} className="shrink-0 text-[#8b6f57]" />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="카페 검색"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#2c2118] outline-none placeholder:text-[#b8aa9b]"
              type="search"
            />
          </label>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/60 px-1 py-1">
            <ThemeToggle />
            {onMobileClose && (
              <button
                type="button"
                onClick={onMobileClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#7d6149]"
                aria-label="목록 닫기"
              >
                <X size={17} />
              </button>
            )}
            <button
              type="button"
              onClick={() => onCollapsedChange?.(true)}
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-full text-[#7d6149] hover:bg-white/80"
              aria-label="사이드바 접기"
            >
              <ChevronLeft size={17} />
            </button>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-y border-[#eee4d8] px-4 py-3">
        <div className="grid grid-cols-3 gap-2">
          {QUICK_CATEGORIES.map(({ label, value, icon: Icon, activeColor, activeShadow }) => {
            const active = activeQuickCategory === value
            return (
              <button
                key={label}
                type="button"
                onClick={() => onQuickCategoryChange(value)}
                aria-pressed={active}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3 text-[11px] font-black transition-all"
                style={active
                  ? { background: activeColor, borderColor: activeColor, color: 'white', boxShadow: `0 6px 14px ${activeShadow}` }
                  : { background: 'white', borderColor: '#eadfd3', color: '#5f4634' }
                }
              >
                <Icon size={16} />
                {label}
              </button>
            )
          })}
        </div>
        <div className="mt-3">
          <FilterBar filters={filters} onChange={onFilterChange} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-black text-[#2c2118]">추천 카페</h2>
          <button
            type="button"
            onClick={onClearSelection}
            className="flex h-8 items-center gap-1.5 rounded-full border border-[#eadfd3] bg-white px-3 text-xs font-black text-[#755b45]"
          >
            <SlidersHorizontal size={13} />
            추천순
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            className="space-y-2.5"
            key={cafes.map(c => c.id).join(',')}
            variants={listVariants}
            initial="hidden"
            animate="show"
          >
            {cafes.map((cafe) => (
              <motion.div key={cafe.id} variants={itemVariants}>
                <CafeListItem
                  cafe={cafe}
                  selected={selectedCafe?.id === cafe.id}
                  distanceOrigin={distanceOrigin}
                  onSelect={onCafeSelect}
                  favorite={favoriteCafeIds.has(cafe.id)}
                  onFavoriteToggle={onFavoriteToggle}
                />
              </motion.div>
            ))}
            {cafes.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#dacdbf] bg-white p-6 text-center text-sm font-semibold text-[#8b7a68]">
                <p>조건에 맞는 카페가 없습니다.</p>
                <button
                  type="button"
                  onClick={onReportNewPlace}
                  className="mt-4 h-10 rounded-xl bg-[#d66612] px-4 text-sm font-black text-white"
                >
                  새 카페 제보하기
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="shrink-0 border-t border-[#eee4d8] bg-white/80 px-4 py-3">
        <Link
          href="/home"
          className="flex h-10 items-center justify-center gap-2 rounded-2xl border border-[#eadfd3] bg-white text-sm font-black text-[#5a2e11] no-underline transition-colors hover:bg-[#fff8ef]"
        >
          <Coffee size={16} />
          원두로 홈
        </Link>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop: inline flex panel */}
      <motion.aside
        className="absolute left-0 top-0 z-10 hidden md:flex h-full flex-col overflow-hidden"
        style={{
          background: 'rgba(246, 243, 236, 0.62)',
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
          borderRight: '1px solid rgba(229, 220, 206, 0.45)',
          boxShadow: '4px 0 24px rgba(90, 46, 17, 0.08)',
        }}
        animate={{ width: collapsed ? 60 : 360 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      >
        {collapsed ? (
          <div className="flex h-full flex-col items-center gap-3 py-4">
            <Link href="/home" className="no-underline">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white/80 shadow-sm">
                <Image
                  src="/image/logo/beenRoad.png"
                  alt="원두로"
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              </span>
            </Link>
            <button
              type="button"
              onClick={() => onCollapsedChange?.(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eadfd3] bg-white/60 text-[#6b432a] hover:bg-white"
              aria-label="사이드바 펼치기"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          expandedContent
        )}
      </motion.aside>

      {/* Mobile: backdrop (expanded only) */}
      <AnimatePresence>
        {mobileExpanded && (
          <motion.div
            className="md:hidden fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setMobileExpanded(false)
              onMobileClose?.()
            }}
          />
        )}
      </AnimatePresence>

      {/* Mobile: drag bottom sheet — always visible */}
      <motion.div
        className="md:hidden fixed inset-x-0 bottom-0 z-50 touch-none"
        animate={{ height: mobileExpanded ? '86dvh' : '92px' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.06, bottom: 0.3 }}
        onDragEnd={(_, info) => {
          if (!mobileExpanded && info.offset.y < -48) {
            setMobileExpanded(true)
          } else if (mobileExpanded && (info.offset.y > 72 || info.velocity.y > 400)) {
            setMobileExpanded(false)
            onMobileClose?.()
          }
        }}
      >
        <aside
          className="flex h-full w-full flex-col overflow-hidden rounded-t-[22px]"
          style={{
            background: 'rgba(246, 243, 236, 0.62)',
            backdropFilter: 'blur(28px) saturate(160%)',
            WebkitBackdropFilter: 'blur(28px) saturate(160%)',
            borderTop: '1px solid rgba(229, 220, 206, 0.45)',
            boxShadow: '0 -8px 32px rgba(58, 38, 18, 0.12)',
          }}
        >
          {/* Handle — tap to toggle */}
          <button
            type="button"
            className="flex w-full shrink-0 cursor-grab items-center justify-center pb-2 pt-3 active:cursor-grabbing"
            onClick={() => {
              const next = !mobileExpanded
              setMobileExpanded(next)
              if (!next) onMobileClose?.()
            }}
            aria-label={mobileExpanded ? '목록 접기' : '목록 펼치기'}
          >
            <div className="h-1 w-10 rounded-full bg-[#c4b5a5]" />
          </button>

          {/* Collapsed: horizontal icon-only category chips */}
          {!mobileExpanded && (
            <div className="flex items-center gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
              {QUICK_CATEGORIES.map(({ label, value, icon: Icon, activeColor }) => {
                const active = activeQuickCategory === value
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onQuickCategoryChange(value)}
                    aria-pressed={active}
                    className="flex shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-black transition-all"
                    style={
                      active
                        ? { background: activeColor, color: 'white' }
                        : { background: 'rgba(255,255,255,0.65)', color: '#5f4634', border: '1px solid rgba(234,223,211,0.8)' }
                    }
                  >
                    <Icon size={15} />
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Expanded: full sidebar content */}
          {mobileExpanded && (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {expandedContent}
            </div>
          )}
        </aside>
      </motion.div>
    </>
  )
}
