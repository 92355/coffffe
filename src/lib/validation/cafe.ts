import type { BeanOrigin, BrewMethod, RoastLevel } from '@/types/cafe'

export interface CafePayload {
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
  images: string[]
  phone?: string
  instagramHandle?: string
  kakaoPlaceId?: string
  showAroma: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key]
  if (typeof value !== 'string') throw new Error(`"${key}" must be a string`)
  return value
}

function readNonEmptyString(record: Record<string, unknown>, key: string): string {
  const value = readString(record, key).trim()
  if (value.length === 0) throw new Error(`"${key}" must be a non-empty string`)
  return value
}

function readOptionalString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key]
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') throw new Error(`"${key}" must be a string`)
  return value
}

function readNumber(record: Record<string, unknown>, key: string): number {
  const value = record[key]
  if (typeof value !== 'number' || Number.isNaN(value)) throw new Error(`"${key}" must be a number`)
  return value
}

function readStringArray(record: Record<string, unknown>, key: string): string[] {
  const value = record[key]
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`"${key}" must be a string array`)
  }
  return value
}

function readOptionalStringArray(record: Record<string, unknown>, key: string): string[] {
  const value = record[key]
  if (value === undefined || value === null) return []
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`"${key}" must be a string array`)
  }
  return value
}

function readOptionalBoolean(record: Record<string, unknown>, key: string, fallback: boolean): boolean {
  const value = record[key]
  if (value === undefined || value === null) return fallback
  if (typeof value !== 'boolean') throw new Error(`"${key}" must be a boolean`)
  return value
}

export function parseCafePayload(value: unknown): CafePayload {
  if (!isRecord(value)) throw new Error('Request body must be an object')

  return {
    id: readNonEmptyString(value, 'id'),
    name: readString(value, 'name'),
    shortDescription: readString(value, 'shortDescription'),
    fullDescription: readString(value, 'fullDescription'),
    address: readString(value, 'address'),
    lat: readNumber(value, 'lat'),
    lng: readNumber(value, 'lng'),
    roastLevels: readStringArray(value, 'roastLevels') as RoastLevel[],
    beanOrigins: readStringArray(value, 'beanOrigins') as BeanOrigin[],
    brewMethods: readStringArray(value, 'brewMethods') as BrewMethod[],
    qualityScore: readNumber(value, 'qualityScore'),
    tags: readStringArray(value, 'tags'),
    openHours: readString(value, 'openHours'),
    closedDays: readStringArray(value, 'closedDays'),
    images: readOptionalStringArray(value, 'images'),
    phone: readOptionalString(value, 'phone'),
    instagramHandle: readOptionalString(value, 'instagramHandle'),
    kakaoPlaceId: readOptionalString(value, 'kakaoPlaceId'),
    showAroma: readOptionalBoolean(value, 'showAroma', true),
  }
}
