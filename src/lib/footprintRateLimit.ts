// Pure rate-limit logic for review submissions.
// DB는 외부에서 lastCreatedAt만 주입한다. (테스트 용이성)

export interface RateLimitResult {
  allowed: boolean
  // 차단 시 남은 대기 시간(초). 허용 시 0.
  retryAfterSeconds: number
}

export interface RateLimitInput {
  // 가장 최근 작성 시각 (UTC Date). 작성 이력이 없으면 null.
  lastCreatedAt: Date | null
  // 쿨다운 윈도우 (시간 단위). PRD 기본: 24시간.
  windowHours: number
  // 현재 시각. 테스트 가능성을 위해 주입 받음.
  now: Date
}

/**
 * Determine whether a new review submission is allowed.
 * 최근 작성 시각 + windowHours 가 현재보다 미래면 차단.
 */
export function checkReviewRateLimit(input: RateLimitInput): RateLimitResult {
  const { lastCreatedAt, windowHours, now } = input

  if (lastCreatedAt === null) {
    return { allowed: true, retryAfterSeconds: 0 }
  }

  const windowMs = windowHours * 60 * 60 * 1000
  const elapsedMs = now.getTime() - lastCreatedAt.getTime()

  if (elapsedMs >= windowMs) {
    return { allowed: true, retryAfterSeconds: 0 }
  }

  const remainingMs = windowMs - elapsedMs
  // 올림으로 1초 미만도 1초로 표시 (사용자 안내 정확성).
  return { allowed: false, retryAfterSeconds: Math.ceil(remainingMs / 1000) }
}
