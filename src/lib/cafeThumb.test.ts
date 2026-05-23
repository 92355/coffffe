import { describe, it, expect } from 'vitest'
import { cafeHue } from './cafeThumb'

describe('cafeHue', () => {
  it('동일한 cafeId는 항상 동일한 hue를 반환한다', () => {
    expect(cafeHue('cafe-001')).toBe(cafeHue('cafe-001'))
    expect(cafeHue('ansan-roastery')).toBe(cafeHue('ansan-roastery'))
  })

  it('결과는 0 이상 359 이하 정수다', () => {
    const ids = ['cafe-001', 'cafe-abc', '', 'x', '한글아이디', '0000']
    for (const id of ids) {
      const hue = cafeHue(id)
      expect(hue).toBeGreaterThanOrEqual(0)
      expect(hue).toBeLessThanOrEqual(359)
      expect(Number.isInteger(hue)).toBe(true)
    }
  })

  it('서로 다른 cafeId는 다른 hue를 반환할 수 있다', () => {
    const hues = new Set(['cafe-001', 'cafe-002', 'cafe-003', 'cafe-004'].map(cafeHue))
    expect(hues.size).toBeGreaterThan(1)
  })
})
