import { isNicknameAnimal } from '@/lib/nickname'

const TEXT_MAX_LENGTH = 50
const NICKNAME_MAX_LENGTH = 60

export function parseReviewText(body: Record<string, unknown>): string {
  const text = typeof body.text === 'string' ? body.text.trim() : ''
  if (text.length === 0 || text.length > TEXT_MAX_LENGTH) {
    throw new Error(`text must be 1-${TEXT_MAX_LENGTH} characters`)
  }
  return text
}

export function parseAnonymousReviewAuthor(
  body: Record<string, unknown>,
): { nickname: string; animal: string } {
  const rawNickname = typeof body.nickname === 'string' ? body.nickname.trim() : ''
  const rawAnimal = typeof body.animal === 'string' ? body.animal : ''
  if (rawNickname.length === 0 || !isNicknameAnimal(rawAnimal)) {
    throw new Error('nickname and animal required for anonymous review')
  }
  return {
    nickname: rawNickname.slice(0, NICKNAME_MAX_LENGTH),
    animal: rawAnimal,
  }
}
