import { readFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

const CAFE_DATA_PATH = new URL('../src/data/cafes.json', import.meta.url)
const ENV_LOCAL_PATH = new URL('../.env.local', import.meta.url)
const REQUIRED_ENV_KEYS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
]

async function loadLocalEnv() {
  try {
    const file = await readFile(ENV_LOCAL_PATH, 'utf8')
    const lines = file.split(/\r?\n/)

    for (const line of lines) {
      const trimmedLine = line.trim()

      if (!trimmedLine || trimmedLine.startsWith('#')) continue

      const separatorIndex = trimmedLine.indexOf('=')
      if (separatorIndex === -1) continue

      const key = trimmedLine.slice(0, separatorIndex).trim()
      const rawValue = trimmedLine.slice(separatorIndex + 1).trim()
      const value = rawValue.replace(/^['"]|['"]$/g, '')

      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return
    }

    throw error
  }
}

function getRequiredEnv(key) {
  const value = process.env[key]

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

function toDatabaseCafe(cafe) {
  return {
    id: cafe.id,
    name: cafe.name,
    short_description: cafe.shortDescription,
    full_description: cafe.fullDescription,
    address: cafe.address,
    lat: cafe.lat,
    lng: cafe.lng,
    roast_levels: cafe.roastLevels,
    bean_origins: cafe.beanOrigins,
    brew_methods: cafe.brewMethods,
    quality_score: cafe.qualityScore,
    tags: cafe.tags,
    open_hours: cafe.openHours,
    closed_days: cafe.closedDays,
    phone: cafe.phone ?? null,
    instagram_handle: cafe.instagramHandle ?? null,
    kakao_place_id: cafe.kakaoPlaceId ?? null,
  }
}

function validateCafe(cafe) {
  const requiredFields = [
    'id',
    'name',
    'shortDescription',
    'fullDescription',
    'address',
    'lat',
    'lng',
    'roastLevels',
    'beanOrigins',
    'brewMethods',
    'qualityScore',
    'tags',
    'openHours',
    'closedDays',
  ]

  for (const field of requiredFields) {
    if (!(field in cafe)) {
      throw new Error(`Cafe "${cafe.id ?? 'unknown'}" is missing "${field}"`)
    }
  }
}

async function readCafes() {
  const file = await readFile(CAFE_DATA_PATH, 'utf8')
  const cafes = JSON.parse(file)

  if (!Array.isArray(cafes)) {
    throw new Error('src/data/cafes.json must contain an array')
  }

  for (const cafe of cafes) {
    validateCafe(cafe)
  }

  return cafes.map(toDatabaseCafe)
}

async function migrate() {
  await loadLocalEnv()

  for (const key of REQUIRED_ENV_KEYS) {
    getRequiredEnv(key)
  }

  const supabase = createClient(
    getRequiredEnv('SUPABASE_URL'),
    getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  )

  const cafes = await readCafes()
  const { error } = await supabase
    .from('cafes')
    .upsert(cafes, { onConflict: 'id' })

  if (error) {
    throw new Error(`Failed to migrate cafes: ${error.message}`)
  }

  console.log(`Migrated ${cafes.length} cafes to Supabase.`)
}

migrate().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
