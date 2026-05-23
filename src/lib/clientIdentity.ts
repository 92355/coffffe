import 'server-only'

import type { NextRequest } from 'next/server'

const ANONYMOUS_ID_HEADER = 'x-anonymous-id'
const FORWARDED_FOR_HEADER = 'x-forwarded-for'
const REAL_IP_HEADER = 'x-real-ip'

export interface ClientIdentity {
  // IP for rate-limit only. Never displayed to users. / 쿨다운 검증에만 사용.
  ip: string
  // Anonymous id from localStorage (via header). 없으면 null.
  anonymousId: string | null
}

/**
 * Extract IP and anonymousId from a Next.js request.
 * - IP는 x-forwarded-for 첫 값(콤마 구분) 우선, 없으면 x-real-ip, 모두 없으면 빈 문자열.
 * - anonymousId는 x-anonymous-id 헤더 (fetchWithIdentity가 자동 첨부).
 */
export function extractClientIdentity(request: NextRequest): ClientIdentity {
  const forwarded = request.headers.get(FORWARDED_FOR_HEADER)
  const realIp = request.headers.get(REAL_IP_HEADER)
  const anonymousHeader = request.headers.get(ANONYMOUS_ID_HEADER)

  return {
    ip: pickFirstForwardedIp(forwarded) ?? realIp ?? '',
    anonymousId: anonymousHeader && anonymousHeader.trim().length > 0
      ? anonymousHeader.trim()
      : null,
  }
}

function pickFirstForwardedIp(forwarded: string | null): string | null {
  if (!forwarded) return null

  const first = forwarded.split(',')[0]?.trim()
  return first && first.length > 0 ? first : null
}
