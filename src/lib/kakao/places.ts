import 'server-only'

import { getRequiredEnv } from '../env'

const KAKAO_SEARCH_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json'
const KAKAO_COORD2ADDRESS_URL = 'https://dapi.kakao.com/v2/local/geo/coord2address.json'
const KAKAO_CAFE_CATEGORY_CODE = 'CE7'

export interface KakaoPlace {
  kakaoPlaceId: string
  name: string
  address: string
  lat: number
  lng: number
  phone?: string
  placeUrl: string
}

interface KakaoPlaceDocument {
  id: string
  place_name: string
  address_name: string
  road_address_name: string
  x: string
  y: string
  phone: string
  place_url: string
}

interface KakaoAddressDocument {
  road_address: { address_name: string } | null
  address: { address_name: string } | null
}

function authHeader(): HeadersInit {
  return { Authorization: `KakaoAK ${getRequiredEnv('KAKAO_REST_API_KEY')}` }
}

function toPlace(doc: KakaoPlaceDocument): KakaoPlace {
  return {
    kakaoPlaceId: doc.id,
    name: doc.place_name,
    address: doc.road_address_name || doc.address_name,
    lat: Number.parseFloat(doc.y),
    lng: Number.parseFloat(doc.x),
    phone: doc.phone || undefined,
    placeUrl: doc.place_url,
  }
}

export async function searchKakaoPlaces(query: string, size: number): Promise<KakaoPlace[]> {
  const params = new URLSearchParams({
    query,
    size: String(size),
    category_group_code: KAKAO_CAFE_CATEGORY_CODE,
  })
  const response = await fetch(`${KAKAO_SEARCH_URL}?${params.toString()}`, {
    headers: authHeader(),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Kakao place search failed: ${response.status}`)
  }

  const data = await response.json() as { documents: KakaoPlaceDocument[] }
  return data.documents.map(toPlace)
}

export async function geocodeKakaoCoords(lat: number, lng: number): Promise<string> {
  const params = new URLSearchParams({ x: String(lng), y: String(lat) })
  const response = await fetch(`${KAKAO_COORD2ADDRESS_URL}?${params.toString()}`, {
    headers: authHeader(),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Kakao geocode failed: ${response.status}`)
  }

  const data = await response.json() as { documents: KakaoAddressDocument[] }
  const doc = data.documents[0]
  return doc?.road_address?.address_name ?? doc?.address?.address_name ?? ''
}
