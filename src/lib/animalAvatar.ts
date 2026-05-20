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

export function getAnimalAvatar(animal: NicknameAnimal): string {
  return ANIMAL_EMOJI[animal]
}
