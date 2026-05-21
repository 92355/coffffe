import type { NicknameAnimal } from '@/lib/nickname'

export const ANIMAL_EMOJI: Record<NicknameAnimal, string> = {
  고양이: '🐱',
  강아지: '🐶',
  여우: '🦊',
  곰: '🐻',
  팬더: '🐼',
  수달: '🦦',
  펭귄: '🐧',
  사슴: '🦌',
  고슴도치: '🦔',
  햄스터: '🐹',
  부엉이: '🦉',
  토끼: '🐰',
  카피바라: '🦫',
  알파카: '🦙',
  미어캣: '🐾',
  비버: '🦫',
  다람쥐: '🐿️',
  코알라: '🐨',
  나무늘보: '🦥',
  라마: '🦙',
}

const ANIMAL_IMAGE_SLUG: Record<NicknameAnimal, string> = {
  고양이: 'cat',
  강아지: 'dog',
  여우: 'fox',
  곰: 'bear',
  팬더: 'panda',
  수달: 'otter',
  펭귄: 'penguin',
  사슴: 'deer',
  고슴도치: 'hedgehog',
  햄스터: 'hamster',
  부엉이: 'owl',
  토끼: 'rabbit',
  카피바라: 'capybara',
  알파카: 'alpaca',
  미어캣: 'meerkat',
  비버: 'beaver',
  다람쥐: 'squirrel',
  코알라: 'koala',
  나무늘보: 'sloth',
  라마: 'llama',
}

export function getAnimalAvatarPath(animal: NicknameAnimal): string {
  return `/image/animal_profill/${ANIMAL_IMAGE_SLUG[animal]}.webp`
}

export function getAnimalAvatar(animal: NicknameAnimal): string {
  return ANIMAL_EMOJI[animal]
}
