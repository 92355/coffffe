import { NextRequest } from 'next/server'
import type { RoastLevel, BeanOrigin, BrewMethod } from '@/types/cafe'
import { applyCafeFilters } from '@/lib/cafeFilters'
import { getCachedCafes } from '@/lib/services/cafe'
import { ok } from '@/lib/response'

export { CAFES_CACHE_TAG } from '@/lib/services/cafe'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const roast = searchParams.get('roast') as RoastLevel | null
  const origin = searchParams.get('origin') as BeanOrigin | null
  const method = searchParams.get('method') as BrewMethod | null

  const result = applyCafeFilters(await getCachedCafes(), { roastLevel: roast, beanOrigin: origin, brewMethod: method })

  return ok(result)
}
