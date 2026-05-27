export interface BeanPayload {
  id: string
  name: string
  nameEn: string
  origin: string
  region: string
  variety: string
  process: string
  roast: string
  notes: string[]
  body: string
  acidity: string
  desc: string
  flag: string
  special: string | null
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function requireString(r: Record<string, unknown>, key: string): string {
  const v = r[key]
  if (typeof v !== 'string' || !v.trim()) throw new Error(`"${key}" is required`)
  return v.trim()
}

function optionalString(r: Record<string, unknown>, key: string): string | null {
  const v = r[key]
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

function requireStringArray(r: Record<string, unknown>, key: string): string[] {
  const v = r[key]
  if (!Array.isArray(v)) throw new Error(`"${key}" must be an array`)
  return v.filter((item): item is string => typeof item === 'string')
}

export function parseBeanPayload(value: unknown): BeanPayload {
  if (!isRecord(value)) throw new Error('Request body must be an object')

  return {
    id: requireString(value, 'id'),
    name: requireString(value, 'name'),
    nameEn: requireString(value, 'nameEn'),
    origin: requireString(value, 'origin'),
    region: requireString(value, 'region'),
    variety: requireString(value, 'variety'),
    process: requireString(value, 'process'),
    roast: requireString(value, 'roast'),
    notes: requireStringArray(value, 'notes'),
    body: requireString(value, 'body'),
    acidity: requireString(value, 'acidity'),
    desc: requireString(value, 'desc'),
    flag: requireString(value, 'flag'),
    special: optionalString(value, 'special'),
  }
}

export function parseBeanUpdate(value: unknown): Omit<BeanPayload, 'id'> & { id: string } {
  return parseBeanPayload(value)
}
