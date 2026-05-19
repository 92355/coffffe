import { NextRequest, NextResponse } from 'next/server'

const KAKAO_REST_API_KEY = 'KAKAO_REST_API_KEY'
const KAKAO_SEARCH_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json'
const KAKAO_CAFE_CATEGORY_CODE = 'CE7'
const MIN_QUERY_LENGTH = 2
const DEFAULT_RESULT_SIZE = 15
const MAX_RESULT_SIZE = 15

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

interface KakaoSearchResponse {
  documents: KakaoPlaceDocument[]
}

interface KakaoPlace {
  kakaoPlaceId: string
  name: string
  address: string
  lat: number
  lng: number
  phone?: string
  placeUrl: string
}

function getRequiredEnv(key: string): string {
  const value = process.env[key]

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

function parseSize(value: string | null): number {
  if (!value) return DEFAULT_RESULT_SIZE

  const parsed = Number.parseInt(value, 10)

  if (Number.isNaN(parsed)) return DEFAULT_RESULT_SIZE

  return Math.min(Math.max(parsed, 1), MAX_RESULT_SIZE)
}

function toPlace(document: KakaoPlaceDocument): KakaoPlace {
  return {
    kakaoPlaceId: document.id,
    name: document.place_name,
    address: document.road_address_name || document.address_name,
    lat: Number.parseFloat(document.y),
    lng: Number.parseFloat(document.x),
    phone: document.phone || undefined,
    placeUrl: document.place_url,
  }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query')?.trim() ?? ''

  if (query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json(
      { error: `query must be at least ${MIN_QUERY_LENGTH} characters` },
      { status: 400 },
    )
  }

  const searchParams = new URLSearchParams({
    query,
    size: String(parseSize(request.nextUrl.searchParams.get('size'))),
    category_group_code: KAKAO_CAFE_CATEGORY_CODE,
  })

  try {
    const response = await fetch(`${KAKAO_SEARCH_URL}?${searchParams.toString()}`, {
      headers: {
        Authorization: `KakaoAK ${getRequiredEnv(KAKAO_REST_API_KEY)}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Kakao place search failed' },
        { status: response.status },
      )
    }

    const data = await response.json() as KakaoSearchResponse

    return NextResponse.json(data.documents.map(toPlace), {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Kakao search error'
    console.error(message)

    return NextResponse.json(
      { error: 'Kakao place search is not configured' },
      { status: 500 },
    )
  }
}
