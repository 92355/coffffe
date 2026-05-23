// KST (Asia/Seoul) calendar-date helpers.
// 발자취 기능의 "오늘" 기준을 단일 진실원으로 관리한다.

const KST_OFFSET_MINUTES = 9 * 60

/**
 * Return the KST calendar date string (YYYY-MM-DD) for the given Date.
 * 입력 Date가 UTC 어느 시점이든 KST 자정 기준 날짜 문자열을 반환.
 */
export function toKstDateString(date: Date): string {
  const utcMs = date.getTime()
  const kstMs = utcMs + KST_OFFSET_MINUTES * 60 * 1000
  const kst = new Date(kstMs)

  const year = kst.getUTCFullYear()
  const month = String(kst.getUTCMonth() + 1).padStart(2, '0')
  const day = String(kst.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Convenience: today's KST date string.
 * 서버에서 매 요청마다 호출되는 핫 패스.
 */
export function todayKstDateString(): string {
  return toKstDateString(new Date())
}
