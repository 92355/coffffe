'use client'

import { useMemo, useState } from 'react'
import type { Cafe, FilterState } from '@/types/cafe'
import type { MapViewState } from '@/types/mapView'
import type { LocationPoint } from '@/types/location'
import { getAnimalAvatarPath } from '@/lib/animalAvatar'
import { useUser } from '@/hooks/useUser'
import { useSavedCafes } from '@/hooks/useSavedCafes'
import { useLocationState } from '@/hooks/useLocationState'
import { useMapState } from '@/hooks/useMapState'
import { useMapViewUI } from '@/hooks/useMapViewUI'
import { useReportState } from '@/hooks/useReportState'
import { useMapSelection } from '@/hooks/useMapSelection'
import { applyCafeFilters, cafeDistanceKm } from '@/lib/cafeFilters'
import MapViewPresentation from './MapViewPresentation'

interface MapViewProps {
  allCafes: Cafe[]
}

const INITIAL_FILTERS: FilterState = {
  roastLevel: null,
  beanOrigin: null,
  brewMethod: null,
}
const NEARBY_CAFE_RADIUS_KM = 1.5
const MOBILE_CAROUSEL_LIMIT = 12

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
  const { selectedCafe, selectedFrom, selectCafe, clearSelection } = useMapSelection(allCafes)
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeQuickCategory, setActiveQuickCategory] = useState<string | null>(null)
  const ui = useMapViewUI()
  const mapState = useMapState()
  const reportState = useReportState(mapState.setMapPickMode, mapState.mapPickMode)
  const locationState = useLocationState()

  const baseFilteredCafes = useMemo(() => {
    return applyCafeFilters(allCafes, {
      roastLevel: filters.roastLevel,
      beanOrigin: filters.beanOrigin,
      brewMethod: filters.brewMethod,
      searchText: searchQuery,
      category: activeQuickCategory,
    })
  }, [activeQuickCategory, allCafes, filters, searchQuery])

  const filteredCafes = useMemo(() => {
    if (mapState.activeMapBounds) {
      return applyCafeFilters(baseFilteredCafes, { bounds: mapState.activeMapBounds })
    }
    return locationState.userLocation
      ? applyCafeFilters(baseFilteredCafes, { nearbyOrigin: { origin: locationState.userLocation, maxKm: NEARBY_CAFE_RADIUS_KM } })
      : baseFilteredCafes
  }, [mapState.activeMapBounds, baseFilteredCafes, locationState.userLocation])

  const mapCafes = useMemo(() => {
    if (!selectedCafe || filteredCafes.some(cafe => cafe.id === selectedCafe.id)) return filteredCafes
    return [...filteredCafes, selectedCafe]
  }, [filteredCafes, selectedCafe])

  const mobileCarouselCafes = useMemo(() => {
    const candidates = locationState.userLocation
      ? [...baseFilteredCafes].sort((left, right) => cafeDistanceKm(left, locationState.userLocation!) - cafeDistanceKm(right, locationState.userLocation!))
      : mapState.currentMapBounds
        ? applyCafeFilters(baseFilteredCafes, { bounds: mapState.currentMapBounds })
        : baseFilteredCafes

    const visibleCafes = candidates.slice(0, MOBILE_CAROUSEL_LIMIT)
    if (!selectedCafe || visibleCafes.some(cafe => cafe.id === selectedCafe.id)) return visibleCafes
    return [...visibleCafes, selectedCafe]
  }, [baseFilteredCafes, mapState.currentMapBounds, selectedCafe, locationState.userLocation])

  const favoriteCafes = useMemo(() => {
    const favoriteOrder = new Map(favoriteCafeIds.map((cafeId, index) => [cafeId, index]))
    return allCafes
      .filter((cafe) => favoriteOrder.has(cafe.id))
      .sort((left, right) => (favoriteOrder.get(left.id) ?? 0) - (favoriteOrder.get(right.id) ?? 0))
  }, [allCafes, favoriteCafeIds])

  const visibleSelectedCafe = selectedCafe && mapCafes.some(cafe => cafe.id === selectedCafe.id)
    ? selectedCafe
    : null
  const hasActiveFilters = filters.roastLevel !== null || filters.beanOrigin !== null || filters.brewMethod !== null
  const profileLabel = getProfileLabel(user, profilePrefs)
  const profileAvatar = getProfileAvatar(user)
  const profileImageUrl = getProfileImageUrl(user, profilePrefs)

  const state: MapViewState = {
    // Data
    allCafes,
    filteredCafes,
    mapCafes,
    mobileCarouselCafes,
    favoriteCafes,

    // Selection
    selectedCafe,
    visibleSelectedCafe,
    selectedFrom,
    selectCafe,
    clearSelection,

    // Filters
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    activeQuickCategory,
    setActiveQuickCategory,
    hasActiveFilters,

    // UI
    ...ui,

    // Map
    ...mapState,

    // Report
    ...reportState,

    // Location
    ...locationState,
    setUserLocation: locationState.setUserLocation as (location: LocationPoint) => void,

    // User / profile
    user,
    profilePrefs,
    regenerateNickname,
    updateProfilePrefs,
    loginWithKakao,
    logout,
    profileLabel,
    profileAvatar,
    profileImageUrl,

    // Favorites
    favoriteCafeIds,
    favoriteCafeIdSet,
    toggleFavoriteCafe,
    favoriteError,
  }

  return <MapViewPresentation {...state} />
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
