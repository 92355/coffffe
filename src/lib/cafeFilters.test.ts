import { describe, it, expect } from 'vitest'
import { applyCafeFilters, matchesFilters, matchesSearch, matchesCategory } from './cafeFilters'
import type { Cafe, FilterState } from '@/types/cafe'
import type { MapBounds } from '@/types/map'

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

describe('applyCafeFilters', () => {
  it('빈 쿼리는 전체 카페를 반환한다', () => {
    const cafes = [makeCafe({ id: 'a' }), makeCafe({ id: 'b' })]
    expect(applyCafeFilters(cafes, {})).toHaveLength(2)
  })

  it('roastLevel 필터 일치', () => {
    const cafes = [
      makeCafe({ id: 'a', roastLevels: ['light'] }),
      makeCafe({ id: 'b', roastLevels: ['dark'] }),
    ]
    expect(applyCafeFilters(cafes, { roastLevel: 'light' })).toHaveLength(1)
    expect(applyCafeFilters(cafes, { roastLevel: 'light' })[0]?.id).toBe('a')
  })

  it('beanOrigin 필터 일치', () => {
    const cafes = [
      makeCafe({ id: 'a', beanOrigins: ['ethiopia'] }),
      makeCafe({ id: 'b', beanOrigins: ['kenya'] }),
    ]
    expect(applyCafeFilters(cafes, { beanOrigin: 'kenya' })).toHaveLength(1)
  })

  it('brewMethod 필터 일치', () => {
    const cafes = [
      makeCafe({ id: 'a', brewMethods: ['espresso'] }),
      makeCafe({ id: 'b', brewMethods: ['pour-over'] }),
    ]
    expect(applyCafeFilters(cafes, { brewMethod: 'espresso' })).toHaveLength(1)
  })

  it('복합 필터 AND 조건', () => {
    const match = makeCafe({ id: 'a', roastLevels: ['light'], beanOrigins: ['ethiopia'], brewMethods: ['pour-over'] })
    const nomatch = makeCafe({ id: 'b', roastLevels: ['dark'], beanOrigins: ['ethiopia'], brewMethods: ['pour-over'] })
    const cafes = [match, nomatch]
    expect(applyCafeFilters(cafes, { roastLevel: 'light', beanOrigin: 'ethiopia', brewMethod: 'pour-over' })).toHaveLength(1)
    expect(applyCafeFilters(cafes, { roastLevel: 'light', beanOrigin: 'ethiopia', brewMethod: 'pour-over' })[0]?.id).toBe('a')
  })

  it('searchText 이름 일치', () => {
    const cafes = [
      makeCafe({ id: 'a', name: '안산 로스터리', fullDescription: '로스터리', shortDescription: '로스터리', address: '경기도', tags: [] }),
      makeCafe({ id: 'b', name: '서울 카페', fullDescription: '서울', shortDescription: '서울', address: '서울시', tags: [] }),
    ]
    expect(applyCafeFilters(cafes, { searchText: '안산' })).toHaveLength(1)
    expect(applyCafeFilters(cafes, { searchText: '안산' })[0]?.id).toBe('a')
  })

  it('searchText 대소문자 무시', () => {
    const cafes = [makeCafe({ id: 'a', name: 'Ansan Roastery' })]
    expect(applyCafeFilters(cafes, { searchText: 'ANSAN' })).toHaveLength(1)
  })

  it('빈 searchText는 전체 통과', () => {
    const cafes = [makeCafe({ id: 'a' }), makeCafe({ id: 'b' })]
    expect(applyCafeFilters(cafes, { searchText: '' })).toHaveLength(2)
    expect(applyCafeFilters(cafes, { searchText: '   ' })).toHaveLength(2)
  })

  it('category 태그 일치', () => {
    const cafes = [
      makeCafe({ id: 'a', name: 'a', shortDescription: 'a', fullDescription: 'a', address: 'a', tags: ['스페셜티'] }),
      makeCafe({ id: 'b', name: 'b', shortDescription: 'b', fullDescription: 'b', address: 'b', tags: ['로스터리'] }),
    ]
    expect(applyCafeFilters(cafes, { category: '스페셜티' })).toHaveLength(1)
    expect(applyCafeFilters(cafes, { category: '스페셜티' })[0]?.id).toBe('a')
  })

  it('null category는 전체 통과', () => {
    const cafes = [makeCafe({ id: 'a' }), makeCafe({ id: 'b' })]
    expect(applyCafeFilters(cafes, { category: null })).toHaveLength(2)
  })

  it('bounds 필터 — 범위 내 카페만', () => {
    const bounds: MapBounds = { north: 37.40, south: 37.30, east: 126.90, west: 126.80 }
    const inside = makeCafe({ id: 'a', lat: 37.35, lng: 126.85 })
    const outside = makeCafe({ id: 'b', lat: 37.50, lng: 126.85 })
    expect(applyCafeFilters([inside, outside], { bounds })).toHaveLength(1)
    expect(applyCafeFilters([inside, outside], { bounds })[0]?.id).toBe('a')
  })

  it('nearbyOrigin — 반경 내 카페만', () => {
    const origin = { lat: 37.32, lng: 126.83 }
    const near = makeCafe({ id: 'a', lat: 37.32, lng: 126.83 })
    const far = makeCafe({ id: 'b', lat: 37.80, lng: 127.20 })
    expect(applyCafeFilters([near, far], { nearbyOrigin: { origin, maxKm: 1.5 } })).toHaveLength(1)
    expect(applyCafeFilters([near, far], { nearbyOrigin: { origin, maxKm: 1.5 } })[0]?.id).toBe('a')
  })

  it('결과 없음 케이스', () => {
    const cafes = [makeCafe({ roastLevels: ['light'] })]
    expect(applyCafeFilters(cafes, { roastLevel: 'dark' })).toHaveLength(0)
  })
})

describe('matchesFilters (legacy)', () => {
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

describe('matchesSearch (legacy)', () => {
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

describe('matchesCategory (legacy)', () => {
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
