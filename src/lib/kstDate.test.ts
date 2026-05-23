import { describe, it, expect } from 'vitest'
import { toKstDateString } from './kstDate'

describe('toKstDateString', () => {
  it('returns KST date for UTC midnight (which is 09:00 KST same day)', () => {
    // UTC 2026-05-23 00:00 = KST 2026-05-23 09:00
    expect(toKstDateString(new Date('2026-05-23T00:00:00Z'))).toBe('2026-05-23')
  })

  it('returns next day at KST midnight boundary (UTC 15:00 → KST 00:00)', () => {
    // UTC 2026-05-23 15:00 = KST 2026-05-24 00:00 → 다음 날
    expect(toKstDateString(new Date('2026-05-23T15:00:00Z'))).toBe('2026-05-24')
  })

  it('returns same day just before KST midnight (UTC 14:59 → KST 23:59)', () => {
    // UTC 2026-05-23 14:59 = KST 2026-05-23 23:59 → 같은 날
    expect(toKstDateString(new Date('2026-05-23T14:59:59Z'))).toBe('2026-05-23')
  })

  it('handles year/month rollover at KST midnight', () => {
    // UTC 2026-12-31 15:00 = KST 2027-01-01 00:00
    expect(toKstDateString(new Date('2026-12-31T15:00:00Z'))).toBe('2027-01-01')
  })

  it('pads single-digit month and day', () => {
    expect(toKstDateString(new Date('2026-01-05T03:00:00Z'))).toBe('2026-01-05')
  })
})
