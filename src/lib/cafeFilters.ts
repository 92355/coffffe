import type { Cafe, FilterState, RoastLevel, BeanOrigin, BrewMethod } from '@/types/cafe'
import type { LocationPoint } from '@/types/location'
import type { MapBounds } from '@/types/map'

export interface FilterQuery {
  roastLevel?: RoastLevel | null
  beanOrigin?: BeanOrigin | null
  brewMethod?: BrewMethod | null
  searchText?: string
  category?: string | null
  bounds?: MapBounds
  nearbyOrigin?: { origin: LocationPoint; maxKm: number }
}

const EARTH_RADIUS_KM = 6371

export function applyCafeFilters(cafes: Cafe[], query: FilterQuery): Cafe[] {
  return cafes.filter((cafe) => {
    if (query.roastLevel && !cafe.roastLevels.includes(query.roastLevel)) return false
    if (query.beanOrigin && !cafe.beanOrigins.includes(query.beanOrigin)) return false
    if (query.brewMethod && !cafe.brewMethods.includes(query.brewMethod)) return false

    if (query.searchText) {
      const normalized = query.searchText.trim().toLowerCase()
      if (normalized) {
        const target = buildSearchTarget(cafe)
        if (!target.includes(normalized)) return false
      }
    }

    if (query.category) {
      const normalized = query.category.trim().toLowerCase()
      if (normalized) {
        const target = buildSearchTarget(cafe)
        if (!target.includes(normalized)) return false
      }
    }

    if (query.bounds && !isCafeInsideBounds(cafe, query.bounds)) return false

    if (query.nearbyOrigin && cafeDistanceKm(cafe, query.nearbyOrigin.origin) > query.nearbyOrigin.maxKm) return false

    return true
  })
}

function buildSearchTarget(cafe: Cafe): string {
  return `${cafe.name} ${cafe.shortDescription} ${cafe.fullDescription} ${cafe.address} ${cafe.tags.join(' ')}`.toLowerCase()
}

export function isCafeInsideBounds(cafe: Cafe, bounds: MapBounds): boolean {
  return cafe.lat >= bounds.south && cafe.lat <= bounds.north &&
    cafe.lng >= bounds.west && cafe.lng <= bounds.east
}

export function cafeDistanceKm(cafe: Cafe, origin: LocationPoint): number {
  const latDelta = ((cafe.lat - origin.lat) * Math.PI) / 180
  const lngDelta = ((cafe.lng - origin.lng) * Math.PI) / 180
  const originLat = (origin.lat * Math.PI) / 180
  const cafeLat = (cafe.lat * Math.PI) / 180
  const h =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(originLat) * Math.cos(cafeLat) *
    Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2)

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

// Legacy exports — kept for backward compat during transition
export function matchesFilters(cafe: Cafe, filters: FilterState): boolean {
  return applyCafeFilters([cafe], {
    roastLevel: filters.roastLevel,
    beanOrigin: filters.beanOrigin,
    brewMethod: filters.brewMethod,
  }).length > 0
}

export function matchesSearch(cafe: Cafe, query: string): boolean {
  return applyCafeFilters([cafe], { searchText: query }).length > 0
}

export function matchesCategory(cafe: Cafe, category: string | null): boolean {
  return applyCafeFilters([cafe], { category }).length > 0
}
