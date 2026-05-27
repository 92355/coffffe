import { NextRequest } from 'next/server'
import { searchKakaoPlaces } from '@/lib/kakao/places'
import { badRequest, noStore, serverError } from '@/lib/response'

const MIN_QUERY_LENGTH = 2
const DEFAULT_RESULT_SIZE = 15
const MAX_RESULT_SIZE = 15

function parseSize(value: string | null): number {
  if (!value) return DEFAULT_RESULT_SIZE
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) return DEFAULT_RESULT_SIZE
  return Math.min(Math.max(parsed, 1), MAX_RESULT_SIZE)
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query')?.trim() ?? ''

  if (query.length < MIN_QUERY_LENGTH) {
    return badRequest(`query must be at least ${MIN_QUERY_LENGTH} characters`)
  }

  try {
    const places = await searchKakaoPlaces(query, parseSize(request.nextUrl.searchParams.get('size')))
    return noStore(places)
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Unknown Kakao search error')
    return serverError('Kakao place search is not configured')
  }
}
