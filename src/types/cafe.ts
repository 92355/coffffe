export type RoastLevel = 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark'
export type BrewMethod = 'espresso' | 'pour-over' | 'cold-brew' | 'aeropress' | 'siphon'
export type BeanOrigin =
  | 'ethiopia'
  | 'colombia'
  | 'kenya'
  | 'brazil'
  | 'guatemala'
  | 'indonesia'
  | 'panama'
  | 'rwanda'
  | 'costa-rica'

export const ROAST_LABELS: Record<RoastLevel, string> = {
  'light': '라이트',
  'medium-light': '미디엄 라이트',
  'medium': '미디엄',
  'medium-dark': '미디엄 다크',
  'dark': '다크',
}

export const ORIGIN_LABELS: Record<BeanOrigin, string> = {
  'ethiopia': '에티오피아',
  'colombia': '콜롬비아',
  'kenya': '케냐',
  'brazil': '브라질',
  'guatemala': '과테말라',
  'indonesia': '인도네시아',
  'panama': '파나마',
  'rwanda': '르완다',
  'costa-rica': '코스타리카',
}

export const BREW_LABELS: Record<BrewMethod, string> = {
  'espresso': '에스프레소',
  'pour-over': '푸어오버',
  'cold-brew': '콜드브루',
  'aeropress': '에어로프레스',
  'siphon': '사이폰',
}

export interface Cafe {
  id: string
  name: string
  shortDescription: string
  fullDescription: string
  address: string
  lat: number
  lng: number
  roastLevels: RoastLevel[]
  beanOrigins: BeanOrigin[]
  brewMethods: BrewMethod[]
  qualityScore: number
  tags: string[]
  openHours: string
  closedDays: string[]
  images?: string[]
  phone?: string
  instagramHandle?: string
  kakaoPlaceId?: string
  updatedAt?: string
}

export interface FilterState {
  roastLevel: RoastLevel | null
  beanOrigin: BeanOrigin | null
  brewMethod: BrewMethod | null
}
