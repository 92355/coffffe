import { NextRequest, NextResponse } from 'next/server'

const KAKAO_REST_API_KEY = 'KAKAO_REST_API_KEY'
const KAKAO_COORD2ADDRESS_URL = 'https://dapi.kakao.com/v2/local/geo/coord2address.json'

interface KakaoAddressDocument {
  road_address: { address_name: string } | null
  address: { address_name: string } | null
}

interface KakaoCoord2AddressResponse {
  documents: KakaoAddressDocument[]
}

function getRequiredEnv(key: string): string {
  const value = process.env[key]

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

function readCoordinate(value: string | null, key: string): number {
  const parsed = Number.parseFloat(value ?? '')

  if (Number.isNaN(parsed)) {
    throw new Error(`"${key}" must be a valid coordinate`)
  }

  return parsed
}

export async function GET(request: NextRequest) {
  try {
    const lat = readCoordinate(request.nextUrl.searchParams.get('lat'), 'lat')
    const lng = readCoordinate(request.nextUrl.searchParams.get('lng'), 'lng')
    const searchParams = new URLSearchParams({
      x: String(lng),
      y: String(lat),
    })
    const response = await fetch(`${KAKAO_COORD2ADDRESS_URL}?${searchParams.toString()}`, {
      headers: {
        Authorization: `KakaoAK ${getRequiredEnv(KAKAO_REST_API_KEY)}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Kakao geocode failed' }, { status: response.status })
    }

    const data = await response.json() as KakaoCoord2AddressResponse
    const firstDocument = data.documents[0]

    return NextResponse.json({
      address: firstDocument?.road_address?.address_name ?? firstDocument?.address?.address_name ?? '',
    }, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown geocode error'

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
