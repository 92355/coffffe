export const NICKNAME_STORAGE_KEY = 'wonduro_user'

export const NICKNAME_ADJECTIVES = [
  '부드러운',
  '진한',
  '향긋한',
  '따뜻한',
  '고소한',
  '산뜻한',
  '묵직한',
  '달콤한',
  '차분한',
  '경쾌한',
  '은은한',
  '선명한',
  '깊은',
  '느긋한',
  '포근한',
  '깔끔한',
  '싱그러운',
  '반짝이는',
  '담백한',
  '여유로운',
] as const

export const COFFEE_NOUNS = [
  '라떼',
  '에스프레소',
  '콜드브루',
  '아메리카노',
  '카푸치노',
  '핸드드립',
  '플랫화이트',
  '마키아토',
  '모카',
  '바닐라라떼',
  '고구마라떼',
  '스트롱커피',
  '더치커피',
  '리스트레토',
  '룽고',
  '디카페인',
] as const

export const NICKNAME_ANIMALS = [
  '고양이',
  '강아지',
  '여우',
  '곰',
  '팬더',
  '수달',
  '펭귄',
  '사슴',
  '고슴도치',
  '햄스터',
  '부엉이',
  '토끼',
  '카피바라',
  '알파카',
  '미어캣',
  '비버',
  '다람쥐',
  '코알라',
  '나무늘보',
  '라마',
] as const

export type NicknameAnimal = (typeof NICKNAME_ANIMALS)[number]

export interface GeneratedNickname {
  nickname: string
  animal: NicknameAnimal
}

export function generateNickname(): GeneratedNickname {
  const adjective = pickRandomItem(NICKNAME_ADJECTIVES)
  const coffeeNoun = pickRandomItem(COFFEE_NOUNS)
  const animal = pickRandomItem(NICKNAME_ANIMALS)

  return {
    nickname: `${adjective} ${coffeeNoun} ${animal}`,
    animal,
  }
}

export function isNicknameAnimal(value: string): value is NicknameAnimal {
  return NICKNAME_ANIMALS.some((animal) => animal === value)
}

function pickRandomItem<T>(items: readonly T[]): T {
  const randomIndex = Math.floor(Math.random() * items.length)
  const item = items[randomIndex]

  if (item === undefined) {
    throw new Error('Cannot generate nickname from an empty item list.')
  }

  return item
}
