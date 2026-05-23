import { describe, it, expect } from 'vitest'
import { matchesFilters, matchesSearch, matchesCategory } from './cafeFilters'
import type { Cafe, FilterState } from '@/types/cafe'

function makeCafe(overrides: Partial<Cafe> = {}): Cafe {
  return {
    id: 'test-cafe',
    name: '테스트 카페',
    shortDescription: '핸드드립 전문',
    fullDescription: '안산 스페셜티 커피',
    address: '경기도 안산시',
    lat: 37.32,
    lng: 126.83,
    roastLevels: ['medium'],
    beanOrigins: ['ethiopia'],
    brewMethods: ['pour-over'],
    qualityScore: 4,
    tags: ['조용한', '작업하기좋은'],
    openHours: '09:00~21:00',
    closedDays: [],
    images: [],
    showAroma: true,
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

const emptyFilters: FilterState = { roastLevel: null, beanOrigin: null, brewMethod: null }

describe('matchesFilters', () => {
  it('모든 필터가 null이면 모든 카페를 통과시킨다', () => {
    expect(matchesFilters(makeCafe(), emptyFilters)).toBe(true)
  })

  it('roastLevel 필터가 일치하면 통과한다', () => {
    const cafe = makeCafe({ roastLevels: ['light', 'medium'] })
    expect(matchesFilters(cafe, { ...emptyFilters, roastLevel: 'light' })).toBe(true)
  })

  it('roastLevel 필터가 불일치하면 제외한다', () => {
    const cafe = makeCafe({ roastLevels: ['medium'] })
    expect(matchesFilters(cafe, { ...emptyFilters, roastLevel: 'dark' })).toBe(false)
  })

  it('beanOrigin 필터가 일치하면 통과한다', () => {
    const cafe = makeCafe({ beanOrigins: ['ethiopia', 'kenya'] })
    expect(matchesFilters(cafe, { ...emptyFilters, beanOrigin: 'kenya' })).toBe(true)
  })

  it('brewMethod 필터가 불일치하면 제외한다', () => {
    const cafe = makeCafe({ brewMethods: ['pour-over'] })
    expect(matchesFilters(cafe, { ...emptyFilters, brewMethod: 'espresso' })).toBe(false)
  })

  it('복합 필터는 AND 조건으로 동작한다', () => {
    const cafe = makeCafe({ roastLevels: ['light'], beanOrigins: ['ethiopia'], brewMethods: ['pour-over'] })
    expect(matchesFilters(cafe, { roastLevel: 'light', beanOrigin: 'ethiopia', brewMethod: 'pour-over' })).toBe(true)
    expect(matchesFilters(cafe, { roastLevel: 'light', beanOrigin: 'kenya', brewMethod: 'pour-over' })).toBe(false)
  })
})

describe('matchesSearch', () => {
  it('빈 쿼리는 모든 카페를 통과시킨다', () => {
    expect(matchesSearch(makeCafe(), '')).toBe(true)
    expect(matchesSearch(makeCafe(), '   ')).toBe(true)
  })

  it('카페 이름 부분 일치 시 통과한다', () => {
    const cafe = makeCafe({ name: '안산 로스터리' })
    expect(matchesSearch(cafe, '로스터리')).toBe(true)
  })

  it('대소문자를 무시한다', () => {
    const cafe = makeCafe({ name: 'Ansan Roastery' })
    expect(matchesSearch(cafe, 'ansan')).toBe(true)
    expect(matchesSearch(cafe, 'ANSAN')).toBe(true)
  })

  it('일치하지 않으면 제외한다', () => {
    const cafe = makeCafe({ name: '테스트 카페', address: '안산시', tags: [] })
    expect(matchesSearch(cafe, '서울')).toBe(false)
  })

  it('태그에서도 검색된다', () => {
    const cafe = makeCafe({ tags: ['조용한', '작업하기좋은'] })
    expect(matchesSearch(cafe, '작업')).toBe(true)
  })
})

describe('matchesCategory', () => {
  it('null 카테고리는 모든 카페를 통과시킨다', () => {
    expect(matchesCategory(makeCafe(), null)).toBe(true)
  })

  it('카테고리가 일치하면 통과한다', () => {
    const cafe = makeCafe({ tags: ['조용한'] })
    expect(matchesCategory(cafe, '조용')).toBe(true)
  })

  it('카테고리가 불일치하면 제외한다', () => {
    const cafe = makeCafe({ name: '테스트 카페', tags: [] })
    expect(matchesCategory(cafe, '루프탑')).toBe(false)
  })
})
