import type { Cafe, FilterState } from '@/types/cafe'

export function matchesFilters(cafe: Cafe, filters: FilterState): boolean {
  if (filters.roastLevel && !cafe.roastLevels.includes(filters.roastLevel)) return false
  if (filters.beanOrigin && !cafe.beanOrigins.includes(filters.beanOrigin)) return false
  if (filters.brewMethod && !cafe.brewMethods.includes(filters.brewMethod)) return false
  return true
}

export function matchesSearch(cafe: Cafe, query: string): boolean {
  if (!query) return true
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  const searchTarget = `${cafe.name} ${cafe.shortDescription} ${cafe.fullDescription} ${cafe.address} ${cafe.tags.join(' ')}`.toLowerCase()
  return searchTarget.includes(normalized)
}

export function matchesCategory(cafe: Cafe, category: string | null): boolean {
  if (!category) return true
  const normalized = category.trim().toLowerCase()
  if (!normalized) return true
  const searchTarget = `${cafe.name} ${cafe.shortDescription} ${cafe.fullDescription} ${cafe.address} ${cafe.tags.join(' ')}`.toLowerCase()
  return searchTarget.includes(normalized)
}
