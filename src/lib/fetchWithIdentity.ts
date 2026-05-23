// Client-side fetch wrapper that auto-attaches x-anonymous-id header.
// 익명 사용자도 footprint API에서 본인을 식별할 수 있도록 한다.

import { NICKNAME_STORAGE_KEY } from './nickname'

const ANONYMOUS_ID_HEADER = 'x-anonymous-id'

interface StoredUserSnapshot {
  anonymousId?: unknown
  id?: unknown
}

function readAnonymousIdFromStorage(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(NICKNAME_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as StoredUserSnapshot
    // 익명 사용자: anonymousId 필드 사용. 로그인 사용자: 카카오 user id를 fallback으로 사용.
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

export async function fetchWithIdentity(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const anonymousId = readAnonymousIdFromStorage()
  const headers = new Headers(init?.headers)
  if (anonymousId && !headers.has(ANONYMOUS_ID_HEADER)) {
    headers.set(ANONYMOUS_ID_HEADER, anonymousId)
  }

  return fetch(input, { ...init, headers })
}
