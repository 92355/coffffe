'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, ChevronDown, Coffee, CupSoda, Heart, Layers, LocateFixed, LogOut, MapPin, Minus, PawPrint, Plus, RefreshCw, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import type { Cafe, FilterState } from '@/types/cafe'
import BottomSheet from '@/components/BottomSheet'
import FilterBar from '@/components/FilterBar'
import ProfileEditSheet from '@/components/ProfileEditSheet'
import ReportSheet from '@/components/ReportSheet'
import Sidebar from '@/components/Sidebar'
import type { MapBounds, MapType, ZoomRequest } from '@/components/map/KakaoMap'
import { getAnimalAvatarPath } from '@/lib/animalAvatar'
import { useUser } from '@/hooks/useUser'
import { useSavedCafes } from '@/hooks/useSavedCafes'
import { useLocationState } from '@/hooks/useLocationState'
import { useMapState } from '@/hooks/useMapState'
import { useMapViewUI } from '@/hooks/useMapViewUI'
import { useReportState } from '@/hooks/useReportState'
import type { LocationPoint } from '@/types/location'
import type { ReportType } from '@/types/report'
import { matchesFilters, matchesSearch, matchesCategory } from '@/lib/cafeFilters'

const KakaoMap = dynamic(() => import('@/components/map/KakaoMap'), { ssr: false })

interface MapViewProps {
  allCafes: Cafe[]
}

const INITIAL_FILTERS: FilterState = {
  roastLevel: null,
  beanOrigin: null,
  brewMethod: null,
}
const MAP_QUICK_CATEGORIES = [
  { label: '전체', value: null, icon: Sparkles, activeColor: '#5a2e11', activeShadow: 'rgba(90,46,17,0.25)' },
  { label: '스페셜티', value: '스페셜티', icon: Coffee, activeColor: '#b45a12', activeShadow: 'rgba(180,90,18,0.28)' },
  { label: '로스터리', value: '로스터리', icon: CupSoda, activeColor: '#7c4d2e', activeShadow: 'rgba(124,77,46,0.28)' },
  { label: '디저트', value: '디저트', icon: BookOpen, activeColor: '#c04b6a', activeShadow: 'rgba(192,75,106,0.28)' },
  { label: '노트북', value: '노트북', icon: SlidersHorizontal, activeColor: '#3a6b9a', activeShadow: 'rgba(58,107,154,0.28)' },
  { label: '반려동물', value: '반려동물', icon: PawPrint, activeColor: '#4a8a4a', activeShadow: 'rgba(74,138,74,0.28)' },
]

export default function MapView({ allCafes }: MapViewProps) {
  const {
    user,
    profilePrefs,
    regenerateNickname,
    updateProfilePrefs,
    loginWithKakao,
    logout,
  } = useUser()
  const { favoriteCafeIds, favoriteCafeIdSet, toggleFavoriteCafe, favoriteError } = useSavedCafes(user)
  const [selectedFrom, setSelectedFrom] = useState<'sidebar' | 'map' | null>(null)
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeQuickCategory, setActiveQuickCategory] = useState<string | null>(null)
  const {
    profileMenuRef,
    profileMenuRefDesktop,
    mobileSheetExpanded,
    setMobileSheetExpanded,
    sidebarCollapsed,
    setSidebarCollapsed,
    filterPanelOpen,
    setFilterPanelOpen,
    profileMenuOpen,
    setProfileMenuOpen,
    profileEditSheetOpen,
    setProfileEditSheetOpen,
    openProfileEdit,
  } = useMapViewUI()
  const {
    mapType,
    zoomRequest,
    currentMapBounds,
    activeMapBounds,
    hasPendingBoundsSearch,
    mapPickMode,
    setMapPickMode,
    handleZoom,
    handleMapTypeToggle,
    handleMapBoundsChange,
    handleSearchCurrentMap,
  } = useMapState()
  const {
    reportSheetOpen,
    reportInitialType,
    reportInitialCafe,
    reportInitialLocation,
    setReportSheetOpen,
    openNewPlaceReport,
    handleStartMapPick,
    handleMapPickComplete,
  } = useReportState(setMapPickMode, mapPickMode)
  const {
    userLocation,
    locationPermissionModalOpen,
    isRequestingLocation,
    locationPermissionError,
    locationRequestId,
    setUserLocation,
    setLocationPermissionModalOpen,
    setLocationPermissionError,
    triggerLocationRefresh,
    requestUserLocation,
  } = useLocationState()

  const baseFilteredCafes = useMemo(() => {
    return allCafes.filter(cafe =>
      matchesFilters(cafe, filters) &&
      matchesSearch(cafe, searchQuery) &&
      matchesCategory(cafe, activeQuickCategory)
    )
  }, [activeQuickCategory, allCafes, filters, searchQuery])

  const filteredCafes = useMemo(() => {
    if (!activeMapBounds) return baseFilteredCafes

    return baseFilteredCafes.filter(cafe => isCafeInsideBounds(cafe, activeMapBounds))
  }, [activeMapBounds, baseFilteredCafes])
  const favoriteCafes = useMemo(() => {
    const favoriteOrder = new Map(favoriteCafeIds.map((cafeId, index) => [cafeId, index]))

    return allCafes
      .filter((cafe) => favoriteOrder.has(cafe.id))
      .sort((left, right) => (favoriteOrder.get(left.id) ?? 0) - (favoriteOrder.get(right.id) ?? 0))
  }, [allCafes, favoriteCafeIds])

  const visibleSelectedCafe = selectedCafe && filteredCafes.some(cafe => cafe.id === selectedCafe.id)
    ? selectedCafe
    : null
  const hasActiveFilters = filters.roastLevel !== null || filters.beanOrigin !== null || filters.brewMethod !== null
  const profileLabel = getProfileLabel(user, profilePrefs)
  const profileAvatar = getProfileAvatar(user)
  const profileImageUrl = getProfileImageUrl(user, profilePrefs)

  const profileDropdown = profileMenuOpen ? (
    <div className="glass-map-bar absolute right-0 top-[calc(100%+0.5rem)] w-[min(calc(100vw-2rem),20rem)] rounded-xl p-3 text-[#5a2e11] dark:text-white" style={{ background: 'color-mix(in srgb, var(--background) 68%, rgba(255,255,255,0.18))', border: '1px solid color-mix(in srgb, var(--foreground) 20%, transparent)', boxShadow: '0 8px 26px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
      <div className="mb-2 rounded-lg bg-[#f8efe6] p-3 dark:bg-white/12">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f2d8c1] dark:bg-white/12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profileImageUrl ?? profileAvatar} alt="" className="h-full w-full rounded-full object-cover" />
          </span>
          <span className="min-w-0 truncate text-sm font-black">{profileLabel}</span>
          {user?.type === 'anonymous' ? (
            <button
              type="button"
              onClick={regenerateNickname}
              className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#eadccb] bg-white text-[#6f3b17] transition-colors hover:bg-[#fff7ed] dark:border-white/12 dark:bg-white/10 dark:text-white/78 dark:hover:bg-white/14"
              aria-label="닉네임 새로고침"
              title="닉네임 새로고침"
            >
              <RefreshCw size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { void logout() }}
              className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#eadccb] bg-white text-[#6f3b17] transition-colors hover:bg-[#fff7ed] dark:border-white/12 dark:bg-white/10 dark:text-white/78 dark:hover:bg-white/14"
              aria-label="로그아웃"
              title="로그아웃"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
        <p className="mt-2 text-[11px] font-bold leading-4 text-[#8a6042] dark:text-white/68">
          {user?.type === 'authenticated'
            ? '함께 만들어가는 "원두로"에 오신걸 환영합니다'
            : <><br />회원가입 전 임시 닉네임이에요.<br />귀여운 친구로 얼른 데려가세요!</>}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => { openNewPlaceReport(); setProfileMenuOpen(false) }}
          className="h-9 rounded-lg border border-[#eadccb] bg-white px-3 text-xs font-black text-[#6f3b17] transition-colors hover:bg-[#f8efe6] dark:border-white/18 dark:bg-white/16 dark:text-white/90 dark:hover:bg-white/22"
        >
          제보하기
        </button>
        <button
          type="button"
          onClick={openProfileEdit}
          className="h-9 rounded-lg border border-[#eadccb] bg-white px-3 text-xs font-black text-[#6f3b17] transition-colors hover:bg-[#f8efe6] dark:border-white/18 dark:bg-white/16 dark:text-white/90 dark:hover:bg-white/22"
        >
          내 정보 수정
        </button>
      </div>

      {user?.type === 'authenticated' && user.isAdmin && (
        <button
          type="button"
          onClick={() => { window.location.href = '/admin' }}
          className="mt-2 h-10 w-full rounded-lg border border-[#5a2e11] bg-[#5a2e11] px-4 text-sm font-black text-white transition-colors hover:bg-[#43210c]"
        >
          관리자 페이지
        </button>
      )}

      <div className="mt-2 rounded-lg border border-[#eadccb] bg-white p-2 dark:border-white/18 dark:bg-white/12">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-black text-[#6f3b17] dark:text-white">
          <Heart size={13} fill="currentColor" />
          저장한 카페 {favoriteCafeIds.length}
        </div>
        {favoriteError && (
          <p className="mb-2 rounded-md bg-[#fff4ed] px-2 py-1.5 text-[11px] font-bold leading-5 text-[#b94a12] dark:bg-[rgba(214,102,18,0.14)] dark:text-[#ffb06c]">
            {favoriteError}
          </p>
        )}
        <div className="max-h-28 space-y-1 overflow-y-auto">
          {favoriteCafes.length > 0 ? favoriteCafes.map((cafe) => (
            <button
              key={cafe.id}
              type="button"
              onClick={() => {
                setSelectedCafe(cafe)
                setProfileMenuOpen(false)
              }}
              className="flex h-8 w-full items-center justify-between gap-2 rounded-md px-2 text-left text-xs font-bold text-[#5a2e11] hover:bg-[#f8efe6] dark:text-white/90 dark:hover:bg-white/14"
            >
              <span className="min-w-0 truncate">{cafe.name}</span>
              <span className="shrink-0 text-[#b45a15] dark:text-[#ffb06c]">{cafe.qualityScore.toFixed(1)}</span>
            </button>
          )) : (
            <p className="px-2 py-1 text-[11px] font-bold leading-4 text-[#8a6042] dark:text-white/68">
              카페 카드의 하트를 눌러 저장해보세요.
            </p>
          )}
        </div>
      </div>

      {user?.type !== 'authenticated' && (
        <button
          type="button"
          onClick={loginWithKakao}
          className="mt-2 h-10 w-full rounded-lg bg-[#fee500] px-4 text-sm font-black text-[#381e1f] transition-colors hover:bg-[#f7dc00]"
        >
          카카오 로그인하기
        </button>
      )}
    </div>
  ) : null

  return (
    <div className="relative h-dvh overflow-hidden">
      <Sidebar
        cafes={filteredCafes}
        filters={filters}
        onFilterChange={setFilters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCafe={visibleSelectedCafe}
        distanceOrigin={userLocation}
        onCafeSelect={(cafe) => {
          setSelectedCafe(cafe)
          setSelectedFrom('sidebar')
        }}
        activeQuickCategory={activeQuickCategory}
        onQuickCategoryChange={setActiveQuickCategory}
        onClearSelection={() => {
          setSelectedCafe(null)
          setSelectedFrom(null)
        }}
        onReportNewPlace={openNewPlaceReport}
        favoriteCafeIds={favoriteCafeIdSet}
        onFavoriteToggle={(cafeId) => {
          void toggleFavoriteCafe(cafeId)
        }}
        mobileOpen={false}
        onMobileClose={() => {}}
        onMobileExpandedChange={setMobileSheetExpanded}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        mobileShowDetail={selectedFrom === 'sidebar'}
        mobileBottomBarHidden={selectedFrom === 'map' && Boolean(visibleSelectedCafe)}
      />

      <div className="absolute inset-0">
      <KakaoMap
          cafes={filteredCafes}
          selectedCafe={visibleSelectedCafe}
          onCafeSelect={(cafe) => {
            setSelectedCafe(cafe)
            setSelectedFrom('map')
          }}
          onMapBoundsChange={handleMapBoundsChange}
          mapType={mapType}
          zoomRequest={zoomRequest}
          locationRequestId={locationRequestId}
          onUserLocationChange={setUserLocation}
          onMapClick={handleMapPickComplete}
        />

      {mapPickMode && (
        <div className="pointer-events-none absolute inset-x-4 top-[140px] z-30 flex justify-center">
            <div className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl border border-[#eadccb] bg-white px-4 py-3 text-sm font-black text-[#5a2e11] shadow-[0_18px_44px_rgba(60,40,20,0.16)] dark:border-white/18 dark:bg-white/16 dark:text-white dark:shadow-[0_18px_44px_rgba(0,0,0,0.34)]">
              <MapPin size={16} className="shrink-0 text-[#d66612]" />
              지도에서 제보할 카페 위치를 눌러주세요.
              <button
                type="button"
                onClick={() => setMapPickMode(false)}
                className="ml-auto rounded-full px-2 py-1 text-xs text-[#80624a] hover:bg-[#f8efe6] dark:text-white/58 dark:hover:bg-white/10"
              >
                취소
              </button>
            </div>
          </div>
        )}

      {/* Floating top bar — mobile only */}
      <div className="pointer-events-none absolute inset-x-4 top-4 z-30 flex flex-col gap-2 md:hidden">
        <div className="glass-map-bar pointer-events-auto flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: 'color-mix(in srgb, var(--background) 68%, rgba(255,255,255,0.18))', border: '1px solid color-mix(in srgb, var(--foreground) 20%, transparent)', boxShadow: '0 8px 26px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
          <Link href="/home" className="flex shrink-0 items-center no-underline">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f8efe6] dark:bg-white/10">
              <Image src="/image/logo/beenRoad.png" alt="원두로" width={32} height={32} className="h-full w-full object-cover" priority />
            </span>
          </Link>
          <span className="mx-0.5 h-4 w-px shrink-0 bg-[#eee4d8] dark:bg-white/12" />
          <label className="flex min-w-0 flex-1 items-center gap-2">
            <Search size={16} className="shrink-0 text-[#8b6f57] dark:text-white/72" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="카페, 지역, 메뉴 검색"
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#2c2118] outline-none placeholder:text-[#b8aa9b] dark:text-white dark:placeholder:text-white/52 [&::-webkit-search-cancel-button]:hidden"
              type="search"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f4eee7] text-[#8b6f57] dark:bg-white/16 dark:text-white/72"
                aria-label="검색어 지우기"
              >
                <X size={12} />
              </button>
            )}
          </label>
          <button
            type="button"
            onClick={() => setFilterPanelOpen((prev) => !prev)}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
              filterPanelOpen || hasActiveFilters
                ? 'border-[#d66612] bg-[#d66612] text-white'
                : 'border-[#eadfd3] bg-white text-[#6f3b17] hover:bg-[#f8efe6] dark:border-white/18 dark:bg-white/16 dark:text-white/90 dark:hover:bg-white/22'
            }`}
            aria-label="필터"
            aria-pressed={filterPanelOpen}
          >
            <SlidersHorizontal size={15} />
          </button>
          <div ref={profileMenuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((current) => !current)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-[#eadfd3] bg-white py-1 pl-1.5 pr-2.5 text-[#6f3b17] transition-colors hover:bg-[#f8efe6] dark:border-white/18 dark:bg-white/16 dark:text-white/90 dark:hover:bg-white/22"
              aria-label="프로필 메뉴"
              aria-expanded={profileMenuOpen}
              title={profileLabel}
            >
              <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#f2d8c1] dark:bg-white/12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profileImageUrl ?? profileAvatar} alt="" className="h-full w-full rounded-full object-cover" />
              </span>
              <ChevronDown
                size={13}
                className={`transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {profileDropdown}
          </div>
        </div>

        <AnimatePresence>
          {filterPanelOpen && (
            <motion.div
              className="glass-map-bar pointer-events-auto overflow-hidden rounded-2xl"
              style={{ background: 'color-mix(in srgb, var(--background) 68%, rgba(255,255,255,0.18))', border: '1px solid color-mix(in srgb, var(--foreground) 20%, transparent)', boxShadow: '0 8px 26px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)' }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              <div className="p-3">
                <div className="mb-3 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {MAP_QUICK_CATEGORIES.map(({ label, value, icon: Icon, activeColor, activeShadow }) => {
                    const active = activeQuickCategory === value
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setActiveQuickCategory(value)}
                        aria-pressed={active}
                        style={active
                          ? { background: activeColor, borderColor: activeColor, color: 'white', boxShadow: `0 4px 10px ${activeShadow}` }
                          : undefined
                        }
                        className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-black whitespace-nowrap transition-all ${
                          active ? '' : 'border-[#eadfd3] bg-white text-[#5f4634] dark:border-white/18 dark:bg-white/16 dark:text-white/88'
                        }`}
                      >
                        <Icon size={13} />
                        {label}
                      </button>
                    )
                  })}
                </div>
                <FilterBar filters={filters} onChange={setFilters} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop-only profile button */}
      <div ref={profileMenuRefDesktop} className="pointer-events-none absolute right-4 top-4 z-30 hidden md:block">
        <div className="pointer-events-auto relative">
          <button
            type="button"
            onClick={() => setProfileMenuOpen((current) => !current)}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-[#eadfd3] bg-white py-1 pl-1.5 pr-2.5 text-[#6f3b17] transition-colors hover:bg-[#f8efe6] dark:border-white/18 dark:bg-white/16 dark:text-white/90 dark:hover:bg-white/22"
            aria-label="프로필 메뉴"
            aria-expanded={profileMenuOpen}
            title={profileLabel}
            style={{ boxShadow: '0 6px 18px rgba(60, 40, 20, 0.08)' }}
          >
            <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#f2d8c1] dark:bg-white/12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profileImageUrl ?? profileAvatar} alt="" className="h-full w-full rounded-full object-cover" />
            </span>
            <ChevronDown
              size={13}
              className={`transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {profileDropdown}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-[84px] z-20 flex justify-center px-4 md:top-4">
        <button
          type="button"
          onClick={() => handleSearchCurrentMap((bounds) => {
            setSelectedCafe((currentCafe) => {
              if (!currentCafe || !isCafeInsideBounds(currentCafe, bounds)) return null
              return currentCafe
            })
          })}
          disabled={!hasPendingBoundsSearch || !currentMapBounds}
          className="glass-map-btn pointer-events-auto flex h-10 items-center gap-2 rounded-full px-4 text-sm font-black text-[#6f3b17] disabled:cursor-not-allowed disabled:opacity-60 dark:text-white/90"
          style={{ background: 'color-mix(in srgb, var(--background) 68%, rgba(255,255,255,0.18))', border: '1px solid color-mix(in srgb, var(--foreground) 20%, transparent)', boxShadow: '0 6px 20px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)' }}
        >
          <Search size={15} />
          이 지역 검색
        </button>
      </div>

      <div className="pointer-events-none absolute right-4 top-1/2 z-20 -translate-y-1/2 flex flex-col gap-3">
          <div className="glass-map-btn pointer-events-auto overflow-hidden rounded-2xl" style={{ background: 'color-mix(in srgb, var(--background) 68%, rgba(255,255,255,0.18))', border: '1px solid color-mix(in srgb, var(--foreground) 20%, transparent)', boxShadow: '0 6px 20px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
            <button
              type="button"
              onClick={() => handleZoom('in')}
              className="flex h-[38px] w-[38px] items-center justify-center text-[#6f3b17] transition-colors hover:bg-white/45 dark:text-white/90 dark:hover:bg-white/16"
              aria-label="확대"
            >
              <Plus size={14} />
            </button>
            <div className="mx-2 h-px bg-[#eee4d8] dark:bg-white/12" />
            <button
              type="button"
              onClick={() => handleZoom('out')}
              className="flex h-[38px] w-[38px] items-center justify-center text-[#6f3b17] transition-colors hover:bg-white/45 dark:text-white/90 dark:hover:bg-white/16"
              aria-label="축소"
            >
              <Minus size={14} />
            </button>
          </div>
          <button
            type="button"
            onClick={handleMapTypeToggle}
            className="glass-map-btn pointer-events-auto flex h-[38px] w-[38px] items-center justify-center rounded-2xl text-[#6f3b17] dark:text-white/90"
            style={{ background: 'color-mix(in srgb, var(--background) 68%, rgba(255,255,255,0.18))', border: '1px solid color-mix(in srgb, var(--foreground) 20%, transparent)', boxShadow: '0 6px 20px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)' }}
            aria-label="지도 레이어"
          >
            <Layers size={15} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (userLocation) {
                triggerLocationRefresh()
              } else {
                setLocationPermissionError(null)
                setLocationPermissionModalOpen(true)
              }
            }}
            className="glass-map-btn pointer-events-auto flex h-[38px] w-[38px] items-center justify-center rounded-2xl text-[#6f3b17] dark:text-white/90"
            style={{ background: 'color-mix(in srgb, var(--background) 68%, rgba(255,255,255,0.18))', border: '1px solid color-mix(in srgb, var(--foreground) 20%, transparent)', boxShadow: '0 6px 20px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)' }}
            aria-label="현재 위치"
          >
            <LocateFixed size={15} />
          </button>
        </div>

      {/* 카페 발견 배지 — 데스크탑: 하단 가운데 / 모바일: 바텀시트 위 */}
      <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2 hidden md:block">
        <BreadBadge count={filteredCafes.length} />
      </div>
      <AnimatePresence>
        {!mobileSheetExpanded && (
          <motion.div
            className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 md:hidden"
            style={{ bottom: 'calc(92px + 12px)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <BreadBadge count={filteredCafes.length} small />
          </motion.div>
        )}
      </AnimatePresence>


      <div className="md:hidden">
        <BottomSheet
          cafe={selectedFrom === 'map' ? visibleSelectedCafe : null}
          onClose={() => setSelectedCafe(null)}
          favorite={visibleSelectedCafe ? favoriteCafeIdSet.has(visibleSelectedCafe.id) : false}
          onFavoriteToggle={(cafeId) => {
            void toggleFavoriteCafe(cafeId)
          }}
        />
      </div>
      {reportSheetOpen && (
        <ReportSheet
          cafes={allCafes}
          user={user}
          initialType={reportInitialType}
          initialCafe={reportInitialCafe}
          initialLocation={reportInitialLocation}
          onClose={() => setReportSheetOpen(false)}
          onStartMapPick={handleStartMapPick}
        />
      )}
      {profileEditSheetOpen && (
        <ProfileEditSheet
          user={user}
          profilePrefs={profilePrefs}
          onProfilePrefsChange={updateProfilePrefs}
          onRegenerateNickname={regenerateNickname}
          onClose={() => setProfileEditSheetOpen(false)}
        />
      )}

      {locationPermissionModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1f150f]/55 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-permission-title"
            className="relative w-full max-w-sm rounded-2xl border border-[#eadccb] bg-white p-5 text-center text-[#5a2e11] shadow-[0_24px_70px_rgba(34,20,10,0.28)] dark:border-white/12 dark:bg-[#171514] dark:text-white dark:shadow-[0_24px_70px_rgba(0,0,0,0.48)]"
          >
            <button
              type="button"
              onClick={() => setLocationPermissionModalOpen(false)}
              aria-label="닫기"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-[#80624a] hover:bg-[#f8efe6] dark:text-white/58 dark:hover:bg-white/10"
            >
              <X size={18} />
            </button>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8efe6] text-[#d66612] dark:bg-[rgba(214,102,18,0.16)] dark:text-[#ffb06c]">
              <LocateFixed size={22} />
            </div>
            <h2 id="location-permission-title" className="mt-4 text-lg font-black">
              위치접근 권한을 허용해주세요
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#80624a] dark:text-white/62">
              내 현 위치를 기준으로 가까운 카페 거리와 지도를 더 정확하게 보여드릴게요.
            </p>
            {locationPermissionError && (
              <p className="mt-3 rounded-xl bg-[#fff4ed] px-3 py-2 text-xs font-bold leading-5 text-[#b94a12] dark:bg-[rgba(214,102,18,0.14)] dark:text-[#ffb06c]">
                {locationPermissionError}
              </p>
            )}
            <button
              type="button"
              onClick={requestUserLocation}
              disabled={isRequestingLocation}
              className="mt-5 h-11 w-full rounded-xl bg-[#d66612] px-4 text-sm font-black text-white shadow-[0_12px_28px_rgba(150,72,14,0.28)] transition-colors hover:bg-[#c45b0d] disabled:cursor-wait disabled:opacity-70"
            >
              {isRequestingLocation ? '위치 확인중' : '위치접근권한 허용하기'}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

function isCafeInsideBounds(cafe: Cafe, bounds: MapBounds): boolean {
  const isInsideLatitude = cafe.lat >= bounds.south && cafe.lat <= bounds.north
  const isInsideLongitude = cafe.lng >= bounds.west && cafe.lng <= bounds.east

  return isInsideLatitude && isInsideLongitude
}

function getProfileLabel(user: ReturnType<typeof useUser>['user'], profilePrefs: ReturnType<typeof useUser>['profilePrefs']): string {
  if (!user) return '익명 사용자'
  if (user.type === 'authenticated' && profilePrefs.nicknamePreference === 'kakao') return user.kakaoNickname

  return user.type === 'authenticated' ? user.siteNickname : user.nickname
}

function getProfileAvatar(user: ReturnType<typeof useUser>['user']): string {
  if (!user) return '/image/animal_profill/cat.webp'
  if (user.type === 'authenticated') return getAnimalAvatarPath(user.siteAnimal)

  return getAnimalAvatarPath(user.animal)
}

function getProfileImageUrl(user: ReturnType<typeof useUser>['user'], profilePrefs: ReturnType<typeof useUser>['profilePrefs']): string | undefined {
  if (user?.type !== 'authenticated' || profilePrefs.avatarPreference !== 'kakao') return undefined

  return user.kakaoProfileImageUrl
}

function BreadBadge({ count, small }: { count: number; small?: boolean }) {
  return (
    <div
      className={`glass-map-sheet pointer-events-auto flex items-center whitespace-nowrap font-black text-[#5a2e11] dark:text-white ${small ? 'h-8 px-4 text-xs' : 'h-11 px-6 text-[15px]'}`}
      style={{
        borderRadius: '16px',
        background: 'color-mix(in srgb, var(--accent) 42%, transparent)',
        border: '1.5px solid color-mix(in srgb, var(--accent) 55%, transparent)',
        boxShadow: '0 8px 32px color-mix(in srgb, var(--accent) 26%, transparent), inset 0 1.5px 0 rgba(255, 255, 255, 0.22)',
      }}
    >
      <span className={`mr-0.5 font-black tabular-nums text-[#3b2008] dark:text-white ${small ? 'text-sm' : 'text-xl'}`}>{count}</span>
      개의 카페 발견
    </div>
  )
}
