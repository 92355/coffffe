// Single source of truth for the 5 reaction emojis.
// 서버 검증과 UI 표시가 모두 이 정의를 참조한다.

export type FootprintEmojiKey = 'coffee' | 'vibe' | 'work' | 'insta' | 'toilet'

export interface FootprintEmojiMeta {
  key: FootprintEmojiKey
  glyph: string
  label: string
  ariaLabel: string
}

export const FOOTPRINT_EMOJIS: readonly FootprintEmojiMeta[] = [
  { key: 'coffee', glyph: '☕', label: '맛있어요', ariaLabel: '커피가 맛있어요' },
  { key: 'vibe', glyph: '🌿', label: '분위기 좋아요', ariaLabel: '분위기가 좋아요' },
  { key: 'work', glyph: '💻', label: '작업하기 좋아요', ariaLabel: '작업하기 좋아요' },
  { key: 'insta', glyph: '📸', label: '인스타 감성', ariaLabel: '인스타 감성이에요' },
  { key: 'toilet', glyph: '🚾', label: '화장실 깨끗해요', ariaLabel: '화장실이 깨끗해요' },
] as const

const VALID_KEYS: ReadonlySet<string> = new Set(FOOTPRINT_EMOJIS.map((emoji) => emoji.key))

/**
 * Validate an arbitrary string against the 5 known emoji keys.
 * 서버 라우트에서 요청 본문 검증용.
 */
export function isFootprintEmojiKey(value: unknown): value is FootprintEmojiKey {
  return typeof value === 'string' && VALID_KEYS.has(value)
}
