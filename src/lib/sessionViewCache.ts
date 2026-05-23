// Session-scoped in-memory cache of cafe IDs whose views have already been
// tracked this session. Prevents duplicate POST /views on bottom-sheet reopen.
//
// 페이지 새로고침까지 유지된다. 새로고침되면 모듈이 다시 로드되어 비워진다.

const trackedCafeIds = new Set<string>()

export function hasTrackedView(cafeId: string): boolean {
  return trackedCafeIds.has(cafeId)
}

export function markViewTracked(cafeId: string): void {
  trackedCafeIds.add(cafeId)
}

/** Test-only reset. 프로덕션 코드에서 호출 금지. */
export function resetSessionViewCacheForTests(): void {
  trackedCafeIds.clear()
}

/** Diagnostic helper. */
export function trackedViewCount(): number {
  return trackedCafeIds.size
}
