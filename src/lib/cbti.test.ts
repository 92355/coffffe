import { describe, it, expect } from 'vitest'
import { calculateCbtiResult, CBTI_RESULTS, CBTI_QUESTIONS } from './cbti'

const ALL_TYPES = ['LSEH', 'LSEC', 'LSFH', 'LSFC', 'LBEH', 'LBEC', 'LBFH', 'LBFC',
  'DSEH', 'DSEC', 'DSFH', 'DSFC', 'DBEH', 'DBEC', 'DBFH', 'DBFC']

describe('calculateCbtiResult', () => {
  it('16가지 유형 모두 올바르게 계산', () => {
    // L, S, E, H → LSEH
    expect(calculateCbtiResult(['L', 'S', 'E', 'H'])).toBe('LSEH')
    // L, S, E, C → LSEC
    expect(calculateCbtiResult(['L', 'S', 'E', 'C'])).toBe('LSEC')
    // L, S, F, H → LSFH
    expect(calculateCbtiResult(['L', 'S', 'F', 'H'])).toBe('LSFH')
    // L, S, F, C → LSFC
    expect(calculateCbtiResult(['L', 'S', 'F', 'C'])).toBe('LSFC')
    // L, B, E, H → LBEH
    expect(calculateCbtiResult(['L', 'B', 'E', 'H'])).toBe('LBEH')
    // L, B, E, C → LBEC
    expect(calculateCbtiResult(['L', 'B', 'E', 'C'])).toBe('LBEC')
    // L, B, F, H → LBFH
    expect(calculateCbtiResult(['L', 'B', 'F', 'H'])).toBe('LBFH')
    // L, B, F, C → LBFC
    expect(calculateCbtiResult(['L', 'B', 'F', 'C'])).toBe('LBFC')
    // D, S, E, H → DSEH
    expect(calculateCbtiResult(['D', 'S', 'E', 'H'])).toBe('DSEH')
    // D, S, E, C → DSEC
    expect(calculateCbtiResult(['D', 'S', 'E', 'C'])).toBe('DSEC')
    // D, S, F, H → DSFH
    expect(calculateCbtiResult(['D', 'S', 'F', 'H'])).toBe('DSFH')
    // D, S, F, C → DSFC
    expect(calculateCbtiResult(['D', 'S', 'F', 'C'])).toBe('DSFC')
    // D, B, E, H → DBEH
    expect(calculateCbtiResult(['D', 'B', 'E', 'H'])).toBe('DBEH')
    // D, B, E, C → DBEC
    expect(calculateCbtiResult(['D', 'B', 'E', 'C'])).toBe('DBEC')
    // D, B, F, H → DBFH
    expect(calculateCbtiResult(['D', 'B', 'F', 'H'])).toBe('DBFH')
    // D, B, F, C → DBFC
    expect(calculateCbtiResult(['D', 'B', 'F', 'C'])).toBe('DBFC')
  })

  it('동점 시 첫 번째(L/S/E/H) 우선', () => {
    // L=D → L wins (>=)
    expect(calculateCbtiResult(['L', 'D', 'S', 'B', 'E', 'F', 'H', 'C'])).toBe('LSEH')
  })

  it('빈 답변은 모두 동점 → LSEH (기본값)', () => {
    expect(calculateCbtiResult([])).toBe('LSEH')
  })

  it('복수 답변으로 다수결 적용', () => {
    // D x3, L x1 → D wins; S/B, E/F, H/C all 0 → default S, E, H
    expect(calculateCbtiResult(['D', 'D', 'D', 'L'])).toBe('DSEH')
  })

  it('10문항 실제 답변 시나리오', () => {
    // 실제 퀴즈: 10 questions, axes: L,S,E,H,L,S,E,H,S,L → L:3,D:0 S:3,B:0 E:2,F:0 H:2,C:0
    const answers = CBTI_QUESTIONS.map((q) => q.choices[0]!.axis)
    const result = calculateCbtiResult(answers)
    expect(ALL_TYPES).toContain(result)
  })
})

describe('CBTI_RESULTS', () => {
  it('16가지 유형 정의 포함', () => {
    for (const type of ALL_TYPES) {
      expect(CBTI_RESULTS[type]).toBeDefined()
      expect(CBTI_RESULTS[type]?.name).toBeTruthy()
      expect(CBTI_RESULTS[type]?.emoji).toBeTruthy()
    }
  })
})
