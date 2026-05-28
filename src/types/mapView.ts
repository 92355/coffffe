import type { Dispatch, RefObject, SetStateAction } from 'react'
import type { Cafe, FilterState } from '@/types/cafe'
import type { LocationPoint } from '@/types/location'
import type { MapBounds } from '@/types/map'
import type { MapType, ZoomRequest } from '@/components/map/KakaoMap'
import type { ReportType } from '@/types/report'
import type { User } from '@/hooks/useUser'
import type { ProfilePrefs } from '@/lib/profilePrefs'
import type { SelectionSource } from '@/hooks/useMapSelection'

export interface MapViewState {
  // Input data
  allCafes: Cafe[]

  // Derived cafe lists
  filteredCafes: Cafe[]
  mapCafes: Cafe[]
  mobileCarouselCafes: Cafe[]
  favoriteCafes: Cafe[]

  // Selection
  selectedCafe: Cafe | null
  visibleSelectedCafe: Cafe | null
  selectedFrom: SelectionSource
  selectCafe: (cafe: Cafe, from: SelectionSource) => void
  clearSelection: () => void

  // Filters
  filters: FilterState
  setFilters: Dispatch<SetStateAction<FilterState>>
  searchQuery: string
  setSearchQuery: Dispatch<SetStateAction<string>>
  activeQuickCategory: string | null
  setActiveQuickCategory: Dispatch<SetStateAction<string | null>>
  hasActiveFilters: boolean

  // UI
  mobileSheetExpanded: boolean
  setMobileSheetExpanded: Dispatch<SetStateAction<boolean>>
  sidebarCollapsed: boolean
  setSidebarCollapsed: Dispatch<SetStateAction<boolean>>
  filterPanelOpen: boolean
  setFilterPanelOpen: Dispatch<SetStateAction<boolean>>
  profileMenuOpen: boolean
  setProfileMenuOpen: Dispatch<SetStateAction<boolean>>
  profileEditSheetOpen: boolean
  setProfileEditSheetOpen: Dispatch<SetStateAction<boolean>>
  openProfileEdit: () => void
  profileMenuRef: RefObject<HTMLDivElement | null>
  profileMenuRefDesktop: RefObject<HTMLDivElement | null>

  // Map
  mapType: MapType
  zoomRequest: ZoomRequest | null
  currentMapBounds: MapBounds | null
  hasPendingBoundsSearch: boolean
  mapPickMode: boolean
  setMapPickMode: (active: boolean) => void
  handleZoom: (direction: ZoomRequest['direction']) => void
  handleMapTypeToggle: () => void
  handleMapBoundsChange: (bounds: MapBounds) => void
  handleSearchCurrentMap: (onApply?: (bounds: MapBounds) => void) => void

  // Report
  reportSheetOpen: boolean
  reportInitialType: ReportType
  reportInitialCafe: Cafe | null
  reportInitialLocation: LocationPoint | null
  setReportSheetOpen: (open: boolean) => void
  openNewPlaceReport: () => void
  handleStartMapPick: () => void
  handleMapPickComplete: (location: LocationPoint) => void

  // Location
  userLocation: LocationPoint | null
  locationPermissionModalOpen: boolean
  isRequestingLocation: boolean
  locationPermissionError: string | null
  locationRequestId: number
  setUserLocation: (location: LocationPoint) => void
  setLocationPermissionModalOpen: (open: boolean) => void
  setLocationPermissionError: (error: string | null) => void
  triggerLocationRefresh: () => void
  requestUserLocation: () => void

  // User / profile
  user: User | null
  profilePrefs: ProfilePrefs
  regenerateNickname: () => void
  updateProfilePrefs: (prefs: Partial<ProfilePrefs>) => void
  loginWithKakao: () => void
  logout: () => Promise<void>
  profileLabel: string
  profileAvatar: string
  profileImageUrl: string | undefined

  // Favorites
  favoriteCafeIds: string[]
  favoriteCafeIdSet: Set<string>
  toggleFavoriteCafe: (cafeId: string) => Promise<void>
  favoriteError: string | null
}
