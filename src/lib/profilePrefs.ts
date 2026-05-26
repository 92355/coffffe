export type NicknamePreference = 'random' | 'kakao'
export type AvatarPreference = 'emoji' | 'kakao'

export interface ProfilePrefs {
  nicknamePreference: NicknamePreference
  avatarPreference: AvatarPreference
}

export const PROFILE_PREFS_STORAGE_KEY = 'wonduro_profile_prefs'

const DEFAULT_PROFILE_PREFS: ProfilePrefs = {
  nicknamePreference: 'random',
  avatarPreference: 'emoji',
}

interface StoredProfilePrefs {
  nicknamePreference?: unknown
  avatarPreference?: unknown
}

export function getDefaultProfilePrefs(): ProfilePrefs {
  return { ...DEFAULT_PROFILE_PREFS }
}

export function readProfilePrefs(): ProfilePrefs {
  try {
    const rawPrefs = window.localStorage.getItem(PROFILE_PREFS_STORAGE_KEY)
    if (!rawPrefs) return getDefaultProfilePrefs()

    return normalizeProfilePrefs(JSON.parse(rawPrefs) as StoredProfilePrefs)
  } catch (error) {
    console.warn('Failed to read profile preferences. / 프로필 설정 읽기에 실패했습니다.', error)
    return getDefaultProfilePrefs()
  }
}

export function saveProfilePrefs(prefs: ProfilePrefs): void {
  try {
    window.localStorage.setItem(PROFILE_PREFS_STORAGE_KEY, JSON.stringify(normalizeProfilePrefs(prefs)))
  } catch (error) {
    console.warn('Failed to save profile preferences. / 프로필 설정 저장에 실패했습니다.', error)
  }
}

function normalizeProfilePrefs(prefs: StoredProfilePrefs): ProfilePrefs {
  return {
    nicknamePreference: prefs.nicknamePreference === 'kakao' ? 'kakao' : 'random',
    avatarPreference: prefs.avatarPreference === 'kakao' ? 'kakao' : 'emoji',
  }
}
