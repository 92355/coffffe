'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  AtSign,
  BookOpen,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  CupSoda,
  Heart,
  MapPin,
  PawPrint,
  Phone,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import type { Cafe, FilterState } from '@/types/cafe'
import { BREW_LABELS, ORIGIN_LABELS, ROAST_LABELS } from '@/types/cafe'
import type { LocationPoint } from '@/types/location'
import CafeListItem from '@/components/CafeListItem'
import FilterBar from '@/components/FilterBar'
import ThemeToggle from '@/components/ThemeToggle'
import CafeFootprintPanel from '@/components/CafeFootprintPanel'
import { kakaoMapUrl, googleMapUrl, naverMapUrl } from '@/lib/mapNavigation'
import { cafeHue } from '@/lib/cafeThumb'
import { useViewTracker } from '@/hooks/useViewTracker'

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
  onMobileExpandedChange?: (expanded: boolean) => void
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  mobileShowDetail?: boolean
  mobileDetailInitialMode?: MobileSheetMode
  mobileBottomBarHidden?: boolean
}

type MobileSheetMode = 'closed' | 'preview' | 'full'

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

const MOBILE_PREVIEW_HEIGHT_DVH = 34
const MOBILE_FULL_HEIGHT_DVH = 86
const MOBILE_CLOSED_HEIGHT_PX = 36
const MOBILE_DRAG_THRESHOLD_PX = 48
const MOBILE_DISMISS_THRESHOLD_PX = 72
const MOBILE_DISMISS_VELOCITY = 400

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
  onMobileExpandedChange,
  collapsed = false,
  onCollapsedChange,
  mobileShowDetail = false,
  mobileDetailInitialMode = 'full',
  mobileBottomBarHidden = false,
}: SidebarProps) {
  const [mobileSheetMode, setMobileSheetMode] = useState<MobileSheetMode>(mobileOpen ? 'full' : 'closed')
  const mobileExpanded = mobileSheetMode === 'full'
  const mobileSheetOpen = mobileSheetMode !== 'closed'
  const selectedCafeId = selectedCafe?.id ?? null

  useEffect(() => {
    if (!mobileOpen) return

    const animationFrame = window.requestAnimationFrame(() => {
      setMobileSheetMode('full')
    })

    return () => window.cancelAnimationFrame(animationFrame)
  }, [mobileOpen])

  useEffect(() => {
    onMobileExpandedChange?.(mobileSheetOpen)
  }, [mobileSheetOpen, onMobileExpandedChange])

  useEffect(() => {
    if (!mobileShowDetail || !selectedCafeId) return

    const animationFrame = window.requestAnimationFrame(() => {
      setMobileSheetMode(mobileDetailInitialMode)
    })

    return () => window.cancelAnimationFrame(animationFrame)
  }, [mobileDetailInitialMode, mobileShowDetail, selectedCafeId])

  useViewTracker(selectedCafeId)

  const selectedCafeHue = selectedCafe ? cafeHue(selectedCafe.id) : 0
  const cafePlaceholderBg = [
    `radial-gradient(circle at 25% 35%, transparent 22%, rgba(255,255,255,0.10) 22.5%, rgba(255,255,255,0.10) 26%, transparent 26.5%)`,
    `radial-gradient(circle at 68% 58%, transparent 17%, rgba(255,255,255,0.07) 17.5%, rgba(255,255,255,0.07) 21%, transparent 21.5%)`,
    `radial-gradient(circle at 52% 18%, transparent 13%, rgba(255,255,255,0.08) 13.5%, rgba(255,255,255,0.08) 16%, transparent 16.5%)`,
    `hsl(${selectedCafeHue}, 42%, 38%)`,
  ].join(', ')
  const isFavorite = selectedCafe ? favoriteCafeIds.has(selectedCafe.id) : false
  const mobileSheetHeight = mobileSheetMode === 'full'
    ? `${MOBILE_FULL_HEIGHT_DVH}dvh`
    : mobileSheetMode === 'preview'
      ? `${MOBILE_PREVIEW_HEIGHT_DVH}dvh`
      : (mobileBottomBarHidden ? 0 : `${MOBILE_CLOSED_HEIGHT_PX}px`)

  function closeMobileSheet(): void {
    setMobileSheetMode('closed')
    if (mobileShowDetail && selectedCafe) {
      onClearSelection()
    }
    onMobileClose?.()
  }

  function handleMobileSheetDragEnd(info: { offset: { y: number }; velocity: { y: number } }): void {
    const draggedUp = info.offset.y < -MOBILE_DRAG_THRESHOLD_PX
    const draggedDown = info.offset.y > MOBILE_DISMISS_THRESHOLD_PX || info.velocity.y > MOBILE_DISMISS_VELOCITY

    if (draggedUp) {
      setMobileSheetMode('full')
      return
    }

    if (!draggedDown) return

    if (mobileShowDetail && selectedCafe && mobileSheetMode === 'full') {
      setMobileSheetMode('preview')
      return
    }

    closeMobileSheet()
  }

  function handleMobileHandleClick(): void {
    if (mobileShowDetail && selectedCafe) {
      setMobileSheetMode(mobileSheetMode === 'full' ? 'preview' : 'full')
      return
    }

    setMobileSheetMode(mobileSheetMode === 'full' ? 'closed' : 'full')
    if (mobileSheetMode === 'full') onMobileClose?.()
  }

  const desktopDetailPanel = selectedCafe ? (
    <>
      {/* 헤더: 뒤로가기만 */}
      <div className="shrink-0 px-4 py-3">
        <button
          type="button"
          onClick={onClearSelection}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eadfd3] bg-white/60 text-[#6b432a] hover:bg-white dark:border-white/18 dark:bg-white/16 dark:text-white dark:hover:bg-white/22"
          aria-label="목록으로 돌아가기"
        >
          <ArrowLeft size={16} />
        </button>
      </div>

      {/* 썸네일 16:9 */}
      <div className="relative w-full shrink-0" style={{ paddingTop: '56.25%' }}>
        {selectedCafe.images?.[0] ? (
          <Image
            src={selectedCafe.images[0]}
            alt={selectedCafe.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0" style={{ background: cafePlaceholderBg }}>
            <span className="absolute inset-0 flex select-none items-center justify-center text-5xl font-black text-white/80">
              {selectedCafe.name[0]}
            </span>
          </div>
        )}
        {/* 하단 오버레이: 카페 이름 + 찜 버튼 */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/72 to-transparent px-4 pb-3.5 pt-12">
          <h2 className="text-[17px] font-black leading-tight text-white drop-shadow">{selectedCafe.name}</h2>
          <button
            type="button"
            onClick={() => onFavoriteToggle(selectedCafe.id)}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
              isFavorite
                ? 'border-[#d66612] bg-[#d66612] text-white'
                : 'border-white/30 bg-black/28 text-white backdrop-blur-sm hover:bg-black/45'
            }`}
            aria-label={isFavorite ? `${selectedCafe.name} 저장 해제` : `${selectedCafe.name} 저장`}
            aria-pressed={isFavorite}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className="map-sidebar-scroll min-h-0 flex-1 overflow-y-auto">
        {/* 설명 */}
        <div className="px-4 py-4">
          <div className="rounded-xl bg-white/30 px-3.5 py-3 dark:bg-white/5">
            <p className="text-[15px] font-semibold leading-relaxed text-[#3d2410] dark:text-white/95">{selectedCafe.shortDescription}</p>
            {selectedCafe.fullDescription && (
              <p className="mt-3 text-xs leading-relaxed text-[#7d6149] dark:text-white/65">{selectedCafe.fullDescription}</p>
            )}
          </div>
        </div>

        <div className="mx-4 border-t border-[#eee4d8] dark:border-white/10" />

        {/* 태그 */}
        <div className="flex flex-wrap items-center gap-1.5 px-4 py-4">
          <CafeTagList cafe={selectedCafe} />
        </div>

        <div className="mx-4 border-t border-[#eee4d8] dark:border-white/10" />

        {/* 영업정보 카드 */}
        <div className="px-4 py-4">
          <div className="space-y-2.5 rounded-2xl border border-[#eadfd3] bg-white/55 px-3.5 py-3 dark:border-white/12 dark:bg-white/8">
            <div className="flex items-start gap-2.5 text-xs text-[#7d6149] dark:text-white/80">
              <MapPin size={13} className="mt-0.5 shrink-0 text-[#b45a12] dark:text-[#e8975a]" />
              <span className="leading-relaxed">{selectedCafe.address}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#7d6149] dark:text-white/80">
              <Clock size={13} className="shrink-0 text-[#b45a12] dark:text-[#e8975a]" />
              <span>{selectedCafe.openHours}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#7d6149] dark:text-white/80">
              <CalendarX size={13} className="shrink-0 text-[#b45a12] dark:text-[#e8975a]" />
              <span>휴무 {selectedCafe.closedDays.length > 0 ? selectedCafe.closedDays.join(', ') : '정보 없음'}</span>
            </div>
          </div>
        </div>

        {(selectedCafe.phone || selectedCafe.instagramHandle) && (
          <>
            <div className="mx-4 border-t border-[#eee4d8] dark:border-white/10" />
            <div className="flex items-center gap-2 px-4 py-4">
              {selectedCafe.phone && (
                <a
                  href={`tel:${selectedCafe.phone}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadfd3] bg-white text-[#6b432a] transition-colors hover:text-[#2c2118] dark:border-white/18 dark:bg-white/16 dark:text-white/80 dark:hover:text-white"
                  aria-label={`${selectedCafe.name} 전화`}
                >
                  <Phone size={15} />
                </a>
              )}
              {selectedCafe.instagramHandle && (
                <a
                  href={`https://instagram.com/${selectedCafe.instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadfd3] bg-white text-[#6b432a] transition-colors hover:text-[#E1306C] dark:border-white/18 dark:bg-white/16 dark:text-white/80 dark:hover:text-[#E1306C]"
                  aria-label={`${selectedCafe.name} 인스타그램`}
                >
                  <AtSign size={15} />
                </a>
              )}
            </div>
          </>
        )}

        <div className="mx-4 border-t border-[#eee4d8] dark:border-white/10" />

        {/* 지도 검색 카드 */}
        <div className="px-4 py-4">
          <div className="overflow-hidden rounded-2xl border border-[#eadfd3] dark:border-white/12">
            <p className="border-b border-[#eadfd3] bg-white/55 px-3.5 py-2 text-[10px] font-black uppercase tracking-widest text-[#b8aa9b] dark:border-white/12 dark:bg-white/8 dark:text-white/55">
              지도에서 검색
            </p>
            <div className="flex flex-col divide-y divide-[#eadfd3] dark:divide-white/12">
              <a
                href={naverMapUrl(selectedCafe.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center gap-3 bg-white/55 px-3.5 transition-colors hover:bg-[#f0faf5] dark:bg-white/8 dark:hover:bg-white/12"
                aria-label="네이버 지도에서 검색"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white" style={{ background: '#03C75A' }}>N</span>
                <span className="text-sm font-black text-[#5f4634] dark:text-white/88">네이버</span>
              </a>
              <a
                href={kakaoMapUrl(selectedCafe.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center gap-3 bg-white/55 px-3.5 transition-colors hover:bg-[#fffce0] dark:bg-white/8 dark:hover:bg-white/12"
                aria-label="카카오 지도에서 검색"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-[#381e1f]" style={{ background: '#FEE500' }}>K</span>
                <span className="text-sm font-black text-[#5f4634] dark:text-white/88">카카오</span>
              </a>
              <a
                href={googleMapUrl(selectedCafe.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center gap-3 bg-white/55 px-3.5 transition-colors hover:bg-[#eff4ff] dark:bg-white/8 dark:hover:bg-white/12"
                aria-label="구글 지도에서 검색"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white" style={{ background: '#4285F4' }}>G</span>
                <span className="text-sm font-black text-[#5f4634] dark:text-white/88">구글</span>
              </a>
            </div>
          </div>
        </div>

        {/* 발자취 전체 패널 */}
        <div className="px-4 pb-6">
          <CafeFootprintPanel cafeId={selectedCafe.id} />
        </div>
      </div>

    </>
  ) : null

  const mobileDetailPanel = selectedCafe ? (
    <>
      {/* Hero 썸네일 */}
      <div className="relative w-full shrink-0 overflow-hidden" style={{ height: '170px' }}>
        {selectedCafe.images?.[0] ? (
          <Image
            src={selectedCafe.images[0]}
            alt={selectedCafe.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0" style={{ background: cafePlaceholderBg }}>
            <span className="absolute inset-0 flex select-none items-center justify-center text-6xl font-black text-white/80">
              {selectedCafe.name[0]}
            </span>
          </div>
        )}
        {/* 뒤로가기 */}
        <div className="absolute left-3 top-3">
          <button
            type="button"
            onClick={onClearSelection}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm"
            aria-label="목록으로 돌아가기"
          >
            <ArrowLeft size={16} />
          </button>
        </div>
        {/* 이름 + 찜 오버레이 */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/75 to-transparent px-4 pb-4 pt-16">
          <h2 className="text-xl font-black leading-tight text-white drop-shadow">{selectedCafe.name}</h2>
          <button
            type="button"
            onClick={() => onFavoriteToggle(selectedCafe.id)}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
              isFavorite
                ? 'border-[#d66612] bg-[#d66612] text-white'
                : 'border-white/30 bg-black/28 text-white backdrop-blur-sm'
            }`}
            aria-label={isFavorite ? `${selectedCafe.name} 저장 해제` : `${selectedCafe.name} 저장`}
            aria-pressed={isFavorite}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className="map-sidebar-scroll min-h-0 flex-1 overflow-y-auto">
        {/* 설명 */}
        <div className="px-4 pb-3 pt-4">
          <div className="rounded-xl bg-white/30 px-3.5 py-3 dark:bg-white/5">
            <p className="text-[15px] font-semibold leading-relaxed text-[#3d2410] dark:text-white/95">{selectedCafe.shortDescription}</p>
            {selectedCafe.fullDescription && (
              <p className="mt-3 text-xs leading-relaxed text-[#7d6149] dark:text-white/65">{selectedCafe.fullDescription}</p>
            )}
          </div>
        </div>

        {/* 태그 */}
        <div className="flex flex-wrap items-center gap-1.5 px-4 pb-3">
          <CafeTagList cafe={selectedCafe} />
        </div>

        <div className="mx-4 border-t border-[#eee4d8] dark:border-white/10" />

        {/* 영업 정보 */}
        <div className="space-y-2 px-4 py-3">
          <div className="flex items-start gap-2 text-xs text-[#7d6149] dark:text-white/80">
            <MapPin size={13} className="mt-0.5 shrink-0 text-[#b45a12] dark:text-[#e8975a]" />
            <span className="leading-relaxed">{selectedCafe.address}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#7d6149] dark:text-white/80">
            <Clock size={13} className="shrink-0 text-[#b45a12] dark:text-[#e8975a]" />
            <span>{selectedCafe.openHours}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#7d6149] dark:text-white/80">
            <CalendarX size={13} className="shrink-0 text-[#b45a12] dark:text-[#e8975a]" />
            <span>휴무 {selectedCafe.closedDays.length > 0 ? selectedCafe.closedDays.join(', ') : '정보 없음'}</span>
          </div>
        </div>

        {(selectedCafe.phone || selectedCafe.instagramHandle) && (
          <>
            <div className="mx-4 border-t border-[#eee4d8] dark:border-white/10" />
            <div className="flex items-center gap-2 px-4 py-3">
              {selectedCafe.phone && (
                <a
                  href={`tel:${selectedCafe.phone}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadfd3] bg-white/70 text-[#6b432a] dark:border-white/18 dark:bg-white/12 dark:text-white/80"
                  aria-label={`${selectedCafe.name} 전화`}
                >
                  <Phone size={14} />
                </a>
              )}
              {selectedCafe.instagramHandle && (
                <a
                  href={`https://instagram.com/${selectedCafe.instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadfd3] bg-white/70 text-[#6b432a] transition-colors hover:text-[#E1306C] dark:border-white/18 dark:bg-white/12 dark:text-white/80"
                  aria-label={`${selectedCafe.name} 인스타그램`}
                >
                  <AtSign size={14} />
                </a>
              )}
            </div>
          </>
        )}

        <div className="mx-4 border-t border-[#eee4d8] dark:border-white/10" />

        {/* 지도 검색 3등분 */}
        <div className="grid grid-cols-3 gap-2 px-4 pb-4 pt-3">
          <a
            href={naverMapUrl(selectedCafe.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-black text-white transition-opacity hover:opacity-90"
            style={{ background: '#03C75A' }}
            aria-label="네이버 지도에서 검색"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[9px] font-black">N</span>
            네이버
          </a>
          <a
            href={kakaoMapUrl(selectedCafe.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-black text-[#381e1f] transition-opacity hover:opacity-90"
            style={{ background: '#FEE500' }}
            aria-label="카카오 지도에서 검색"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black/10 text-[9px] font-black">K</span>
            카카오
          </a>
          <a
            href={googleMapUrl(selectedCafe.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-black text-white transition-opacity hover:opacity-90"
            style={{ background: '#4285F4' }}
            aria-label="구글 지도에서 검색"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[9px] font-black">G</span>
            구글
          </a>
        </div>

        {/* 발자취 전체 패널 */}
        <div className="px-4 pb-6">
          <CafeFootprintPanel cafeId={selectedCafe.id} />
        </div>
      </div>

    </>
  ) : null

  const mobilePreviewPanel = selectedCafe ? (
    <>
      <div className="flex flex-col px-4 pb-4 pt-1 gap-3">
        {/* 상단: 썸네일 + 이름/설명 + 찜 */}
        <div className="flex items-start gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
            {selectedCafe.images?.[0] ? (
              <Image src={selectedCafe.images[0]} alt={selectedCafe.name} fill className="object-cover" unoptimized />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-white/80" style={{ background: cafePlaceholderBg }}>
                {selectedCafe.name[0]}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-black leading-tight text-[#2c2118] dark:text-white">{selectedCafe.name}</h2>
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[#7d6149] dark:text-white/72">{selectedCafe.shortDescription}</p>
          </div>
          <button
            type="button"
            onClick={() => onFavoriteToggle(selectedCafe.id)}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
              isFavorite
                ? 'border-[#d66612] bg-[#d66612] text-white'
                : 'border-[#eadfd3] bg-white/70 text-[#6b432a] dark:border-white/18 dark:bg-white/12 dark:text-white/80'
            }`}
            aria-label={isFavorite ? `${selectedCafe.name} 저장 해제` : `${selectedCafe.name} 저장`}
            aria-pressed={isFavorite}
          >
            <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* 태그 */}
        <div className="flex flex-wrap items-center gap-1.5">
          <CafeTagList cafe={selectedCafe} />
        </div>

        {/* 주소 */}
        <div className="flex items-start gap-2 text-xs text-[#7d6149] dark:text-white/72">
          <MapPin size={12} className="mt-0.5 shrink-0 text-[#b45a12] dark:text-[#e8975a]" />
          <span className="leading-relaxed">{selectedCafe.address}</span>
        </div>

        {/* 힌트 */}
        <p className="animate-float-hint text-center text-[10px] text-[#b8aa9b] dark:text-white/38">
          위로 올려서 자세히 보기
        </p>
      </div>
    </>
  ) : null

  const expandedContent = (
    <>
      <div className="shrink-0 px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <Link href="/home" className="flex shrink-0 items-center no-underline">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(90,46,17,0.12)] dark:bg-white/12 dark:shadow-[0_4px_12px_rgba(0,0,0,0.28)]">
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
          <label className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl border border-[#eadfd3] bg-white/70 px-3 py-2 dark:border-white/18 dark:bg-white/16">
            <Search size={14} className="shrink-0 text-[#8b6f57] dark:text-white/84" />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="카페 검색"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#2c2118] outline-none placeholder:text-[#8a7a6e] dark:text-white dark:placeholder:text-white/68"
              type="search"
            />
          </label>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/60 px-1 py-1 dark:bg-white/16 [&>button]:text-[#7d6149] dark:[&>button]:text-white/88">
            <ThemeToggle />
            {onMobileClose && (
              <button
                type="button"
                onClick={onMobileClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#7d6149] hover:bg-white/70 dark:text-white/80 dark:hover:bg-white/12 md:hidden"
                aria-label="목록 닫기"
              >
                <X size={17} />
              </button>
            )}
            <button
              type="button"
              onClick={() => onCollapsedChange?.(true)}
              className="hidden h-8 w-8 items-center justify-center rounded-full text-[#7d6149] hover:bg-white/80 dark:text-white/80 dark:hover:bg-white/12 md:flex"
              aria-label="사이드바 접기"
            >
              <ChevronLeft size={17} />
            </button>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-y border-[#eee4d8] px-4 py-3 dark:border-white/10">
        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {QUICK_CATEGORIES.map(({ label, value, icon: Icon, activeColor, activeShadow }) => {
            const active = activeQuickCategory === value
            return (
              <button
                key={label}
                type="button"
                onClick={() => onQuickCategoryChange(value)}
                aria-pressed={active}
                style={active
                  ? { background: activeColor, borderColor: activeColor, color: 'white', boxShadow: `0 4px 10px ${activeShadow}` }
                  : undefined
                }
                className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-black whitespace-nowrap transition-all ${
                  active ? '' : 'border-[#eadfd3] bg-white text-[#5f4634] hover:bg-[#fff8ef] dark:border-white/18 dark:bg-white/16 dark:text-white/88 dark:hover:bg-white/22'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            )
          })}
        </div>
        <div className="mt-3">
          <FilterBar filters={filters} onChange={onFilterChange} />
        </div>
      </div>

      <div className="map-sidebar-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-black text-[#2c2118] dark:text-white">추천 카페</h2>
          <button
            type="button"
            onClick={onClearSelection}
            className="flex h-8 items-center gap-1.5 rounded-full border border-[#eadfd3] bg-white px-3 text-xs font-black text-[#755b45] dark:border-white/18 dark:bg-white/16 dark:text-white/88"
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
              <div className="rounded-2xl border border-dashed border-[#dacdbf] bg-white p-6 text-center text-sm font-semibold text-[#8b7a68] dark:border-white/18 dark:bg-white/12 dark:text-white/84">
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

      <div className="shrink-0 border-t border-[#eee4d8] bg-white/80 px-4 py-3 dark:border-white/14 dark:bg-white/8">
        <Link
          href="/home"
          className="flex h-10 items-center justify-center gap-2 rounded-2xl border border-[#eadfd3] bg-white text-sm font-black text-[#5a2e11] no-underline transition-colors hover:bg-[#fff8ef] dark:border-white/18 dark:bg-white/16 dark:text-white dark:hover:bg-white/22"
        >
          <Coffee size={16} />
          원<span className="text-[#8FAE5A]">두</span>로 홈
        </Link>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop: inline flex panel */}
      <motion.aside
        className="glass-map-sheet absolute left-0 top-0 z-10 hidden md:flex h-full flex-col overflow-hidden"
        style={{
          background: 'color-mix(in srgb, var(--background) 93%, rgba(255,255,255,0.10))',
          borderRight: '1px solid color-mix(in srgb, var(--foreground) 20%, transparent)',
          boxShadow: '4px 0 30px rgba(0, 0, 0, 0.22), inset -1px 0 0 rgba(255,255,255,0.06)',
        }}
        animate={{ width: collapsed ? 60 : 360 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      >
        {collapsed ? (
          <div className="flex h-full flex-col items-center gap-3 py-4">
            <Link href="/home" className="no-underline">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white/80 shadow-sm dark:bg-white/12">
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
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eadfd3] bg-white/60 text-[#6b432a] hover:bg-white dark:border-white/18 dark:bg-white/16 dark:text-white dark:hover:bg-white/22"
              aria-label="사이드바 펼치기"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        ) : selectedCafe ? (
          desktopDetailPanel
        ) : (
          expandedContent
        )}
      </motion.aside>

      {/* Mobile: backdrop (sheet open only) */}
      <AnimatePresence>
        {mobileSheetOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileSheet}
          />
        )}
      </AnimatePresence>

      {/* Mobile: drag bottom sheet — always visible */}
      <motion.div
        className="md:hidden fixed inset-x-0 bottom-0 z-50 touch-none"
        animate={{ height: mobileSheetHeight }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.06, bottom: 0.3 }}
        onDragEnd={(_, info) => handleMobileSheetDragEnd(info)}
      >
        <aside
          className="glass-map-sheet flex h-full w-full flex-col overflow-hidden rounded-t-[22px]"
          style={{
            background: 'color-mix(in srgb, var(--background) 93%, rgba(255,255,255,0.10))',
            borderTop: '1px solid color-mix(in srgb, var(--foreground) 20%, transparent)',
            boxShadow: '0 -8px 36px rgba(0, 0, 0, 0.24), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Handle — tap to toggle */}
          <button
            type="button"
            className="flex w-full shrink-0 cursor-grab items-center justify-center pb-2 pt-3 active:cursor-grabbing"
            onClick={handleMobileHandleClick}
            aria-label={mobileExpanded ? '목록 접기' : '목록 펼치기'}
          >
            <div className="h-1 w-10 rounded-full bg-[#c4b5a5] dark:bg-white/38" />
          </button>


          {/* Open: preview or full sidebar content */}
          {mobileSheetOpen && (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {mobileShowDetail && selectedCafe
                ? (mobileSheetMode === 'preview' ? mobilePreviewPanel : mobileDetailPanel)
                : expandedContent}
            </div>
          )}
        </aside>
      </motion.div>
    </>
  )
}

function CafeTagList({ cafe }: { cafe: Cafe }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {cafe.roastLevels.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-black text-[#b8aa9b] dark:text-white/38">로스팅</span>
          {cafe.roastLevels.map(r => (
            <span key={r} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              {ROAST_LABELS[r]}
            </span>
          ))}
        </div>
      )}
      {cafe.beanOrigins.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-black text-[#b8aa9b] dark:text-white/38">원산지</span>
          {cafe.beanOrigins.map(o => (
            <span key={o} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {ORIGIN_LABELS[o]}
            </span>
          ))}
        </div>
      )}
      {cafe.brewMethods.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-black text-[#b8aa9b] dark:text-white/38">추출방식</span>
          {cafe.brewMethods.map(m => (
            <span key={m} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {BREW_LABELS[m]}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
