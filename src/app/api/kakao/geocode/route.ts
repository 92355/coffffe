import { NextRequest } from 'next/server'
import { geocodeKakaoCoords } from '@/lib/kakao/places'
import { badRequest, noStore } from '@/lib/response'

function readCoordinate(value: string | null, key: string): number {
  const parsed = Number.parseFloat(value ?? '')
  if (Number.isNaN(parsed)) throw new Error(`"${key}" must be a valid coordinate`)
  return parsed
}

export async function GET(request: NextRequest) {
  try {
    const lat = readCoordinate(request.nextUrl.searchParams.get('lat'), 'lat')
    const lng = readCoordinate(request.nextUrl.searchParams.get('lng'), 'lng')
    const address = await geocodeKakaoCoords(lat, lng)
    return noStore({ address })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Unknown geocode error')
  }
}
