import type { ReportType } from '@/types/report'

export interface ReportPayload {
  type: ReportType
  cafeId?: string
  kakaoPlaceId?: string
  name?: string
  address?: string
  lat?: number
  lng?: number
  correctionTypes: string[]
  memo?: string
  anonymousId: string
  nickname: string
}

const REPORT_TYPES: ReportType[] = ['new_place', 'correction']
const MAX_TEXT_LENGTH = 500
const MAX_NAME_LENGTH = 120
const MAX_ADDRESS_LENGTH = 240
const MAX_CORRECTION_TYPES = 8

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readRequiredString(record: Record<string, unknown>, key: string, maxLength = MAX_TEXT_LENGTH): string {
  const value = record[key]
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`"${key}" must be a non-empty string`)
  }
  return value.trim().slice(0, maxLength)
}

function readOptionalString(record: Record<string, unknown>, key: string, maxLength = MAX_TEXT_LENGTH): string | undefined {
  const value = record[key]
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') throw new Error(`"${key}" must be a string`)
  return value.trim().slice(0, maxLength) || undefined
}

function readOptionalNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key]
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'number' || Number.isNaN(value)) throw new Error(`"${key}" must be a number`)
  return value
}

function readCorrectionTypes(record: Record<string, unknown>): string[] {
  const value = record.correctionTypes
  if (value === undefined || value === null) return []
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error('"correctionTypes" must be a string array')
  }
  return value.map((item) => item.trim()).filter(Boolean).slice(0, MAX_CORRECTION_TYPES)
}

export function parseReportPayload(value: unknown): ReportPayload {
  if (!isRecord(value)) throw new Error('Request body must be an object')

  const type = readRequiredString(value, 'type') as ReportType
  if (!REPORT_TYPES.includes(type)) throw new Error('"type" must be new_place or correction')

  const payload: ReportPayload = {
    type,
    cafeId: readOptionalString(value, 'cafeId', MAX_NAME_LENGTH),
    kakaoPlaceId: readOptionalString(value, 'kakaoPlaceId', MAX_NAME_LENGTH),
    name: readOptionalString(value, 'name', MAX_NAME_LENGTH),
    address: readOptionalString(value, 'address', MAX_ADDRESS_LENGTH),
    lat: readOptionalNumber(value, 'lat'),
    lng: readOptionalNumber(value, 'lng'),
    correctionTypes: readCorrectionTypes(value),
    memo: readOptionalString(value, 'memo'),
    anonymousId: readRequiredString(value, 'anonymousId', MAX_NAME_LENGTH),
    nickname: readRequiredString(value, 'nickname', MAX_NAME_LENGTH),
  }

  if (type === 'new_place' && !payload.name) {
    throw new Error('"name" is required for new_place reports')
  }
  if (type === 'correction' && !payload.cafeId) {
    throw new Error('"cafeId" is required for correction reports')
  }

  return payload
}
