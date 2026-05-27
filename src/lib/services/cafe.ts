import 'server-only'

import { unstable_cache } from 'next/cache'
import type { Cafe } from '@/types/cafe'
import { listCafes } from '@/lib/repositories/cafe'

export const CAFES_CACHE_TAG = 'cafes'
const CAFES_CACHE_TTL_SECONDS = 300

export const getCachedCafes = unstable_cache(listCafes, [CAFES_CACHE_TAG], {
  tags: [CAFES_CACHE_TAG],
  revalidate: CAFES_CACHE_TTL_SECONDS,
})

export type { Cafe }
