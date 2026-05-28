import { NICKNAME_STORAGE_KEY } from './nickname'

const ANONYMOUS_ID_HEADER = 'x-anonymous-id'

interface StoredUserSnapshot {
  anonymousId?: unknown
  id?: unknown
}

export function getAnonymousId(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(NICKNAME_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as StoredUserSnapshot
    if (typeof parsed.anonymousId === 'string' && parsed.anonymousId.length > 0) {
      return parsed.anonymousId
    }
    if (typeof parsed.id === 'string' && parsed.id.length > 0) {
      return `auth:${parsed.id}`
    }
    return null
  } catch {
    return null
  }
}

export function attachTo(headers: Headers): Headers {
  const anonymousId = getAnonymousId()
  if (anonymousId && !headers.has(ANONYMOUS_ID_HEADER)) {
    headers.set(ANONYMOUS_ID_HEADER, anonymousId)
  }
  return headers
}
