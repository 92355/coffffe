'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Bell, ChevronDown, Heart, Layers, List, LocateFixed, LogOut, MapPin, Minus, Plus, RefreshCw, Search, X } from 'lucide-react'
import type { Cafe, FilterState } from '@/types/cafe'
import BottomSheet from '@/components/BottomSheet'
import ProfileEditSheet from '@/components/ProfileEditSheet'
import ReportSheet from '@/components/ReportSheet'
import Sidebar from '@/components/Sidebar'
import type { MapBounds, MapType, ZoomRequest } from '@/components/map/KakaoMap'
import { getAnimalAvatarPath } from '@/lib/animalAvatar'
import { useUser } from '@/hooks/useUser'
import { useSavedCafes } from '@/hooks/useSavedCafes'
import type { LocationPoint } from '@/types/location'
import type { ReportType } from '@/types/report'

const KakaoMap = dynamic(() => import('@/components/map/KakaoMap'), { ssr: false })

interface MapViewProps {
  allCafes: Cafe[]
}

const INITIAL_FILTERS: FilterState = {
  roastLevel: null,
  beanOrigin: null,
  brewMethod: null,
}
const GEOLOCATION_TIMEOUT_MS = 10000
const GEOLOCATION_MAXIMUM_AGE_MS = 60000

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
  const profileMenuRef = useRef<HTMLDivElement | null>(null)
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeQuickCategory, setActiveQuickCategory] = useState<string | null>(null)
  const [mobileListOpen, setMobileListOpen] = useState(false)
  const [locationRequestId, setLocationRequestId] = useState(0)
  const [mapType, setMapType] = useState<MapType>('normal')
  const [zoomRequest, setZoomRequest] = useState<ZoomRequest | null>(null)
  const [currentMapBounds, setCurrentMapBounds] = useState<MapBounds | null>(null)
  const [activeMapBounds, setActiveMapBounds] = useState<MapBounds | null>(null)
  const [hasPendingBoundsSearch, setHasPendingBoundsSearch] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [profileEditSheetOpen, setProfileEditSheetOpen] = useState(false)
  const [userLocation, setUserLocation] = useState<LocationPoint | null>(null)
  const [locationPermissionModalOpen, setLocationPermissionModalOpen] = useState(false)
  const [isRequestingLocation, setIsRequestingLocation] = useState(false)
  const [locationPermissionError, setLocationPermissionError] = useState<string | null>(null)
  const [reportSheetOpen, setReportSheetOpen] = useState(false)
  const [reportInitialType, setReportInitialType] = useState<ReportType>('new_place')
  const [reportInitialCafe, setReportInitialCafe] = useState<Cafe | null>(null)
  const [reportInitialLocation, setReportInitialLocation] = useState<LocationPoint | null>(null)
  const [mapPickMode, setMapPickMode] = useState(false)

  const baseFilteredCafes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const normalizedCategory = activeQuickCategory?.trim().toLowerCase() ?? ''

    return allCafes.filter(cafe => {
      if (filters.roastLevel && !cafe.roastLevels.includes(filters.roastLevel)) return false
      if (filters.beanOrigin && !cafe.beanOrigins.includes(filters.beanOrigin)) return false
      if (filters.brewMethod && !cafe.brewMethods.includes(filters.brewMethod)) return false

      const searchTarget = `${cafe.name} ${cafe.shortDescription} ${cafe.fullDescription} ${cafe.address} ${cafe.tags.join(' ')}`.toLowerCase()
      if (normalizedQuery && !searchTarget.includes(normalizedQuery)) return false
      if (normalizedCategory && !searchTarget.includes(normalizedCategory)) return false

      return true
    })
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

  const handleMapBoundsChange = useCallback((bounds: MapBounds) => {
    setCurrentMapBounds(bounds)
    setHasPendingBoundsSearch(currentMapBounds !== null)
  }, [currentMapBounds])

  const handleSearchCurrentMap = useCallback(() => {
    if (!currentMapBounds) return

    setActiveMapBounds(currentMapBounds)
    setHasPendingBoundsSearch(false)
    setSelectedCafe((currentCafe) => {
      if (!currentCafe || !isCafeInsideBounds(currentCafe, currentMapBounds)) return null
      return currentCafe
    })
  }, [currentMapBounds])

  const handleZoom = useCallback((direction: ZoomRequest['direction']) => {
    setZoomRequest((currentRequest) => ({
      id: (currentRequest?.id ?? 0) + 1,
      direction,
    }))
  }, [])

  const handleMapTypeToggle = useCallback(() => {
    setMapType((currentType) => currentType === 'normal' ? 'skyview' : 'normal')
  }, [])

  const openNewPlaceReport = useCallback(() => {
    setReportInitialType('new_place')
    setReportInitialCafe(null)
    setReportInitialLocation(null)
    setReportSheetOpen(true)
    setProfileMenuOpen(false)
    setMobileListOpen(false)
  }, [])

  const openProfileEdit = useCallback(() => {
    setProfileEditSheetOpen(true)
    setProfileMenuOpen(false)
  }, [])

  const handleStartMapPick = useCallback(() => {
    setReportSheetOpen(false)
    setMapPickMode(true)
  }, [])

  const handleMapClick = useCallback((location: LocationPoint) => {
    if (!mapPickMode) return

    setReportInitialType('new_place')
    setReportInitialCafe(null)
    setReportInitialLocation(location)
    setReportSheetOpen(true)
    setMapPickMode(false)
  }, [mapPickMode])

  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationPermissionError('이 기기에서는 위치 기능을 사용할 수 없어요.')
      return
    }

    setIsRequestingLocation(true)
    setLocationPermissionError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLocationPermissionModalOpen(false)
        setIsRequestingLocation(false)
        setLocationRequestId((current) => current + 1)
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? '위치 권한이 거부됐어요. 브라우저 설정에서 위치 권한을 허용한 뒤 다시 눌러주세요.'
          : '현재 위치를 확인하지 못했어요. 잠시 후 다시 시도해주세요.'

        setLocationPermissionError(message)
        setIsRequestingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: GEOLOCATION_TIMEOUT_MS,
        maximumAge: GEOLOCATION_MAXIMUM_AGE_MS,
      },
    )
  }, [])

  useEffect(() => {
    if (!navigator.permissions) {
      window.setTimeout(() => setLocationPermissionModalOpen(true), 0)
      return
    }

    void navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        setLocationRequestId((current) => current + 1)
      } else if (result.state === 'prompt') {
        setLocationPermissionModalOpen(true)
      }
      // denied → 모달 안 띄움
    })
  }, [])

  useEffect(() => {
    if (!profileMenuOpen) return

    const handlePointerDown = (event: PointerEvent): void => {
      const target = event.target

      if (!(target instanceof Node) || profileMenuRef.current?.contains(target)) return

      setProfileMenuOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return

      setProfileMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [profileMenuOpen])

  const visibleSelectedCafe = selectedCafe && filteredCafes.some(cafe => cafe.id === selectedCafe.id)
    ? selectedCafe
    : null
  const profileLabel = getProfileLabel(user, profilePrefs)
  const profileAvatar = getProfileAvatar(user)
  const profileImageUrl = getProfileImageUrl(user, profilePrefs)

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#f3eee7]">
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
          setMobileListOpen(false)
        }}
        activeQuickCategory={activeQuickCategory}
        onQuickCategoryChange={setActiveQuickCategory}
        onClearSelection={() => setSelectedCafe(null)}
        onReportNewPlace={openNewPlaceReport}
        favoriteCafeIds={favoriteCafeIdSet}
        onFavoriteToggle={(cafeId) => {
          void toggleFavoriteCafe(cafeId)
        }}
        mobileOpen={mobileListOpen}
        onMobileClose={() => setMobileListOpen(false)}
      />

      <div className="relative min-w-0 flex-1 overflow-hidden">
        <KakaoMap
          cafes={filteredCafes}
          selectedCafe={visibleSelectedCafe}
          onCafeSelect={setSelectedCafe}
          onMapBoundsChange={handleMapBoundsChange}
          mapType={mapType}
          zoomRequest={zoomRequest}
          locationRequestId={locationRequestId}
          onUserLocationChange={setUserLocation}
          onMapClick={handleMapClick}
        />

        {mapPickMode && (
          <div className="pointer-events-none absolute inset-x-4 top-20 z-30 flex justify-center">
            <div className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl border border-[#eadccb] bg-white px-4 py-3 text-sm font-black text-[#5a2e11] shadow-[0_18px_44px_rgba(60,40,20,0.16)]">
              <MapPin size={16} className="shrink-0 text-[#d66612]" />
              지도에서 제보할 카페 위치를 눌러주세요.
              <button
                type="button"
                onClick={() => setMapPickMode(false)}
                className="ml-auto rounded-full px-2 py-1 text-xs text-[#80624a] hover:bg-[#f8efe6]"
              >
                취소
              </button>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center px-4">
          <button
            type="button"
            onClick={handleSearchCurrentMap}
            disabled={!hasPendingBoundsSearch || !currentMapBounds}
            className="pointer-events-auto flex h-10 items-center gap-2 rounded-full border border-[#eee4d8] bg-white px-4 text-sm font-black text-[#6f3b17] shadow-[0_12px_28px_rgba(60,40,20,0.12)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search size={15} />
            이 지역 검색
          </button>
        </div>

        <div className="pointer-events-none absolute right-4 top-4 z-20 flex items-center gap-2">
          <button
            type="button"
            className="pointer-events-auto hidden h-11 w-11 items-center justify-center rounded-full border border-[#eee4d8] bg-white text-[#6f3b17] shadow-[0_12px_28px_rgba(60,40,20,0.12)] md:flex"
            aria-label="알림"
          >
            <Bell size={18} />
          </button>
          <div ref={profileMenuRef} className="pointer-events-auto relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((current) => !current)}
              className="flex h-11 items-center gap-2 rounded-full border border-[#eee4d8] bg-white py-1 pl-1.5 pr-3 text-[#6f3b17] shadow-[0_12px_28px_rgba(60,40,20,0.12)]"
              aria-label="프로필 메뉴"
              aria-expanded={profileMenuOpen}
              title={profileLabel}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2d8c1] text-lg leading-none overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profileImageUrl ?? profileAvatar} alt="" className="h-full w-full rounded-full object-cover" />
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+0.5rem)] w-[min(calc(100vw-2rem),20rem)] rounded-xl border border-[#eadccb] bg-white p-3 text-[#5a2e11] shadow-[0_18px_44px_rgba(60,40,20,0.16)]">
                <div className="mb-2 rounded-lg bg-[#f8efe6] p-3">
                  <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f2d8c1] text-base leading-none overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={profileImageUrl ?? profileAvatar} alt="" className="h-full w-full rounded-full object-cover" />
                  </span>
                  <span className="min-w-0 truncate text-sm font-black">{profileLabel}</span>
                    {user?.type === 'anonymous' ? (
                      <button
                        type="button"
                        onClick={regenerateNickname}
                        className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#eadccb] bg-white text-[#6f3b17] transition-colors hover:bg-[#fff7ed]"
                        aria-label="닉네임 새로고침"
                        title="닉네임 새로고침"
                      >
                        <RefreshCw size={14} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          void logout()
                        }}
                        className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#eadccb] bg-white text-[#6f3b17] transition-colors hover:bg-[#fff7ed]"
                        aria-label="로그아웃"
                        title="로그아웃"
                      >
                        <LogOut size={14} />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-[11px] font-bold leading-4 text-[#8a6042]">
                    {user?.type === 'authenticated'
                      ? '함께 만들어가는 "원두로"에 오신걸 환영합니다'
                      : '회원가입 전 임시 닉네임이에요. .'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={openNewPlaceReport}
                    className="h-9 rounded-lg border border-[#eadccb] bg-white px-3 text-xs font-black text-[#6f3b17] transition-colors hover:bg-[#f8efe6]"
                  >
                    제보하기
                  </button>
                  <button
                    type="button"
                    onClick={openProfileEdit}
                    className="h-9 rounded-lg border border-[#eadccb] bg-white px-3 text-xs font-black text-[#6f3b17] transition-colors hover:bg-[#f8efe6]"
                  >
                    내 정보 수정
                  </button>
                </div>

                {user?.type === 'authenticated' && user.isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = '/admin'
                    }}
                    className="mt-2 h-10 w-full rounded-lg border border-[#5a2e11] bg-[#5a2e11] px-4 text-sm font-black text-white transition-colors hover:bg-[#43210c]"
                  >
                    관리자 페이지
                  </button>
                )}

                <div className="mt-2 rounded-lg border border-[#eadccb] bg-white p-2">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-black text-[#6f3b17]">
                    <Heart size={13} fill="currentColor" />
                    저장한 카페 {favoriteCafeIds.length}
                  </div>
                  {favoriteError && (
                    <p className="mb-2 rounded-md bg-[#fff4ed] px-2 py-1.5 text-[11px] font-bold leading-4 text-[#b94a12]">
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
                        className="flex h-8 w-full items-center justify-between gap-2 rounded-md px-2 text-left text-xs font-bold text-[#5a2e11] hover:bg-[#f8efe6]"
                      >
                        <span className="min-w-0 truncate">{cafe.name}</span>
                        <span className="shrink-0 text-[#b45a15]">{cafe.qualityScore.toFixed(1)}</span>
                      </button>
                    )) : (
                      <p className="px-2 py-1 text-[11px] font-bold leading-4 text-[#8a6042]">
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
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 md:flex">
          <div className="pointer-events-auto overflow-hidden rounded-2xl border border-[#eee4d8] bg-white shadow-[0_12px_28px_rgba(60,40,20,0.12)]">
            <button
              type="button"
              onClick={() => handleZoom('in')}
              className="flex h-12 w-12 items-center justify-center text-[#6f3b17]"
              aria-label="확대"
            >
              <Plus size={17} />
            </button>
            <div className="mx-2 h-px bg-[#eee4d8]" />
            <button
              type="button"
              onClick={() => handleZoom('out')}
              className="flex h-12 w-12 items-center justify-center text-[#6f3b17]"
              aria-label="축소"
            >
              <Minus size={17} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setLocationRequestId((current) => current + 1)}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#eee4d8] bg-white text-[#6f3b17] shadow-[0_12px_28px_rgba(60,40,20,0.12)]"
            aria-label="현재 위치"
          >
            <LocateFixed size={18} />
          </button>
          <button
            type="button"
            onClick={handleMapTypeToggle}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#eee4d8] bg-white text-[#6f3b17] shadow-[0_12px_28px_rgba(60,40,20,0.12)]"
            aria-label="지도 레이어"
          >
            <Layers size={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            if (userLocation) {
              setLocationRequestId((current) => current + 1)
            } else {
              setLocationPermissionError(null)
              setLocationPermissionModalOpen(true)
            }
          }}
          className={`pointer-events-auto absolute right-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#eee4d8] bg-white text-[#6f3b17] shadow-[0_12px_28px_rgba(60,40,20,0.12)] transition-[bottom] duration-300 md:hidden ${
            visibleSelectedCafe ? 'bottom-[19rem]' : 'bottom-24'
          }`}
          aria-label="현재 위치"
        >
          <LocateFixed size={18} />
        </button>

        <div className="pointer-events-none absolute inset-x-4 bottom-5 z-20 flex items-center justify-between gap-3">
          <div className="pointer-events-auto hidden h-12 items-center gap-2 rounded-full border border-[#eee4d8] bg-white px-5 text-sm font-black text-[#6f3b17] shadow-[0_12px_28px_rgba(60,40,20,0.12)] md:flex">
            <CoffeeDot />
            {filteredCafes.length}곳의 카페 발견
          </div>
          <button
            type="button"
            onClick={() => setMobileListOpen(true)}
            className="pointer-events-auto ml-auto flex h-12 items-center gap-2 rounded-full bg-[#d66612] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(150,72,14,0.28)]"
          >
            <List size={18} />
            목록 보기
          </button>
        </div>

        <BottomSheet
          cafe={visibleSelectedCafe}
          onClose={() => setSelectedCafe(null)}
          favorite={visibleSelectedCafe ? favoriteCafeIdSet.has(visibleSelectedCafe.id) : false}
          onFavoriteToggle={(cafeId) => {
            void toggleFavoriteCafe(cafeId)
          }}
        />
        {reportSheetOpen && (
          <ReportSheet
            cafes={allCafes}
            user={user}
            initialType={reportInitialType}
            initialCafe={reportInitialCafe}
            initialLocation={reportInitialLocation}
            onClose={() => {
              setReportSheetOpen(false)
              setReportInitialLocation(null)
            }}
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
      </div>

      {locationPermissionModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1f150f]/55 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-permission-title"
            className="relative w-full max-w-sm rounded-2xl border border-[#eadccb] bg-white p-5 text-center text-[#5a2e11] shadow-[0_24px_70px_rgba(34,20,10,0.28)]"
          >
            <button
              type="button"
              onClick={() => setLocationPermissionModalOpen(false)}
              aria-label="닫기"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-[#80624a] hover:bg-[#f8efe6]"
            >
              <X size={18} />
            </button>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8efe6] text-[#d66612]">
              <LocateFixed size={22} />
            </div>
            <h2 id="location-permission-title" className="mt-4 text-lg font-black">
              위치접근 권한을 허용해주세요
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#80624a]">
              내 현 위치를 기준으로 가까운 카페 거리와 지도를 더 정확하게 보여드릴게요.
            </p>
            {locationPermissionError && (
              <p className="mt-3 rounded-xl bg-[#fff4ed] px-3 py-2 text-xs font-bold leading-5 text-[#b94a12]">
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

function CoffeeDot() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5a2e11] text-white">
      <span className="h-2.5 w-3.5 rounded-b-full rounded-t-sm border border-current" />
    </span>
  )
}
