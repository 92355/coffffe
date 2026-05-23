import { describe, it, expect } from 'vitest'
import { FOOTPRINT_EMOJIS, isFootprintEmojiKey } from './footprintEmojis'

describe('FOOTPRINT_EMOJIS', () => {
  it('defines exactly 5 emojis', () => {
    expect(FOOTPRINT_EMOJIS).toHaveLength(5)
  })

  it('has unique keys', () => {
    const keys = FOOTPRINT_EMOJIS.map((emoji) => emoji.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('includes all expected keys', () => {
    const keys = FOOTPRINT_EMOJIS.map((emoji) => emoji.key).sort()
    expect(keys).toEqual(['coffee', 'insta', 'toilet', 'vibe', 'work'])
  })

  it('every emoji has non-empty glyph/label/ariaLabel', () => {
    for (const emoji of FOOTPRINT_EMOJIS) {
      expect(emoji.glyph.length).toBeGreaterThan(0)
      expect(emoji.label.length).toBeGreaterThan(0)
      expect(emoji.ariaLabel.length).toBeGreaterThan(0)
    }
  })
})

describe('isFootprintEmojiKey', () => {
  it('accepts each valid key', () => {
    for (const emoji of FOOTPRINT_EMOJIS) {
      expect(isFootprintEmojiKey(emoji.key)).toBe(true)
    }
  })

  it('rejects unknown keys', () => {
    expect(isFootprintEmojiKey('cake')).toBe(false)
    expect(isFootprintEmojiKey('')).toBe(false)
  })

  it('rejects non-string values', () => {
    expect(isFootprintEmojiKey(null)).toBe(false)
    expect(isFootprintEmojiKey(undefined)).toBe(false)
    expect(isFootprintEmojiKey(123)).toBe(false)
    expect(isFootprintEmojiKey({})).toBe(false)
  })
})
