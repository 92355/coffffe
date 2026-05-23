'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { generateNickname, isNicknameAnimal, NICKNAME_STORAGE_KEY, type NicknameAnimal } from '@/lib/nickname'
import {
  getDefaultProfilePrefs,
  readProfilePrefs,
  saveProfilePrefs,
  type ProfilePrefs,
} from '@/lib/profilePrefs'

interface AnonymousUser {
  type: 'anonymous'
  anonymousId: string
  nickname: string
  animal: NicknameAnimal
}

interface AuthenticatedUser {
  type: 'authenticated'
  id: string
  kakaoId: string
  nickname: string
  siteNickname: string
  siteAnimal: NicknameAnimal
  kakaoNickname: string
  kakaoProfileImageUrl?: string
  profileImageUrl?: string
  isAdmin: boolean
}

export type User = AnonymousUser | AuthenticatedUser

interface UserState {
  user: User | null
  profilePrefs: ProfilePrefs
  regenerateNickname: () => void
  updateProfilePrefs: (prefs: Partial<ProfilePrefs>) => void
  loginWithKakao: () => void
  logout: () => Promise<void>
}

interface StoredUser {
  type?: string
  anonymousId?: unknown
  id?: unknown
  kakaoId?: unknown
  nickname?: unknown
  animal?: unknown
  siteNickname?: unknown
  siteAnimal?: unknown
  kakaoNickname?: unknown
  kakaoProfileImageUrl?: unknown
  profileImageUrl?: unknown
  isAdmin?: unknown
}

interface MeResponse {
  user?: {
    type?: string
    id?: unknown
    kakaoId?: unknown
    nickname?: unknown
    profileImageUrl?: unknown
    siteNickname?: unknown
    siteAnimal?: unknown
    isAdmin?: unknown
  } | null
}

let cachedUser: User | null | undefined
const userStoreListeners = new Set<() => void>()

export function useUser(): UserState {
  const user = useSyncExternalStore(subscribeToUserStorage, getUserSnapshot, getServerUserSnapshot)
  const [profilePrefs, setProfilePrefs] = useState<ProfilePrefs>(getInitialProfilePrefs)
  const regenerateNickname = useCallback(() => {
    if (user?.type === 'authenticated') {
      void regenerateAuthenticatedNickname(user)
      return
    }

    const generatedUser = createAnonymousUser()
    setUserSnapshot(generatedUser)
  }, [user])
  const updateProfilePrefs = useCallback((prefs: Partial<ProfilePrefs>) => {
    setProfilePrefs((currentPrefs) => {
      const nextPrefs = {
        ...currentPrefs,
        ...prefs,
      }

      saveProfilePrefs(nextPrefs)
      return nextPrefs
    })
  }, [])
  const loginWithKakao = useCallback(() => {
    const currentUser = getUserSnapshot()
    const params = new URLSearchParams()
    if (currentUser?.type === 'anonymous') {
      params.set('nickname', currentUser.nickname)
      params.set('animal', currentUser.animal)
    }
    params.set('returnTo', `${window.location.pathname}${window.location.search}${window.location.hash}`)
    window.location.href = `/api/auth/kakao/start?${params.toString()}`
  }, [])
  const logout = useCallback(async () => {
    const response = await fetch('/api/auth/logout', { method: 'POST' })
    if (!response.ok) throw new Error('Failed to logout')

    setUserSnapshot(createAnonymousUser())
  }, [])

  useEffect(() => {
    let active = true

    async function syncAuthenticatedUser(): Promise<void> {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' })
        if (!response.ok) return

        const data = await response.json() as MeResponse
        const authenticatedUser = parseAuthenticatedUser(data)
        if (!active) return

        if (authenticatedUser) {
          setUserSnapshot(authenticatedUser)
          return
        }

        const currentUser = getUserSnapshot()
        if (currentUser?.type === 'authenticated') {
          setUserSnapshot(createAnonymousUser())
        }
      } catch (error) {
        console.warn('Failed to sync Kakao user. / 카카오 사용자 동기화에 실패했습니다.', error)
      }
    }

    void syncAuthenticatedUser()

    return () => {
      active = false
    }
  }, [])

  return { user, profilePrefs, regenerateNickname, updateProfilePrefs, loginWithKakao, logout }
}

function getInitialProfilePrefs(): ProfilePrefs {
  if (typeof window === 'undefined') return getDefaultProfilePrefs()

  return readProfilePrefs()
}

function subscribeToUserStorage(onStoreChange: () => void): () => void {
  userStoreListeners.add(onStoreChange)

  const handleStorageChange = (event: StorageEvent): void => {
    if (event.key !== NICKNAME_STORAGE_KEY && event.key !== null) return

    cachedUser = undefined
    onStoreChange()
  }

  window.addEventListener('storage', handleStorageChange)

  return () => {
    userStoreListeners.delete(onStoreChange)
    window.removeEventListener('storage', handleStorageChange)
  }
}

function getServerUserSnapshot(): User | null {
  return null
}

function getUserSnapshot(): User | null {
  if (cachedUser !== undefined) return cachedUser

  const storedUser = readStoredUser()
  if (storedUser) {
    cachedUser = storedUser
    // 구 포맷(anonymousId 없음)으로 저장된 경우 새로 생성된 ID를 영속화한다.
    saveUser(storedUser)
    return cachedUser
  }

  cachedUser = createAnonymousUser()
  saveUser(cachedUser)

  return cachedUser
}

function setUserSnapshot(user: User): void {
  cachedUser = user
  saveUser(user)
  notifyUserStoreListeners()
}

function notifyUserStoreListeners(): void {
  userStoreListeners.forEach((listener) => {
    listener()
  })
}

function createAnonymousUser(): AnonymousUser {
  const generatedNickname = generateNickname()

  return {
    type: 'anonymous',
    anonymousId: createAnonymousId(),
    nickname: generatedNickname.nickname,
    animal: generatedNickname.animal,
  }
}

function parseAuthenticatedUser(response: MeResponse): AuthenticatedUser | null {
  const user = response.user

  if (
    user?.type !== 'authenticated' ||
    typeof user.id !== 'string' ||
    typeof user.kakaoId !== 'string' ||
    typeof user.nickname !== 'string'
  ) {
    return null
  }

  const siteProfile = readSiteProfileFromResponse(user) ?? getCurrentSiteProfile()
  const kakaoNickname = user.nickname
  const kakaoProfileImageUrl = typeof user.profileImageUrl === 'string' ? user.profileImageUrl : undefined

  return {
    type: 'authenticated',
    id: user.id,
    kakaoId: user.kakaoId,
    nickname: siteProfile.nickname,
    siteNickname: siteProfile.nickname,
    siteAnimal: siteProfile.animal,
    kakaoNickname,
    kakaoProfileImageUrl,
    profileImageUrl: kakaoProfileImageUrl,
    isAdmin: user.isAdmin === true,
  }
}

function readSiteProfileFromResponse(user: NonNullable<MeResponse['user']>): Pick<AnonymousUser, 'nickname' | 'animal'> | null {
  if (typeof user.siteNickname !== 'string') return null
  if (typeof user.siteAnimal !== 'string' || !isNicknameAnimal(user.siteAnimal)) return null

  return {
    nickname: user.siteNickname,
    animal: user.siteAnimal,
  }
}

function getCurrentSiteProfile(): Pick<AnonymousUser, 'nickname' | 'animal'> {
  if (cachedUser?.type === 'anonymous') {
    return {
      nickname: cachedUser.nickname,
      animal: cachedUser.animal,
    }
  }

  if (cachedUser?.type === 'authenticated') {
    return {
      nickname: cachedUser.siteNickname,
      animal: cachedUser.siteAnimal,
    }
  }

  const storedUser = readStoredUser()

  if (storedUser?.type === 'anonymous') {
    return {
      nickname: storedUser.nickname,
      animal: storedUser.animal,
    }
  }

  if (storedUser?.type === 'authenticated') {
    return {
      nickname: storedUser.siteNickname,
      animal: storedUser.siteAnimal,
    }
  }

  const generatedUser = createAnonymousUser()

  return {
    nickname: generatedUser.nickname,
    animal: generatedUser.animal,
  }
}

function createAnonymousId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `anonymous-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function readStoredUser(): User | null {
  try {
    const rawUser = window.localStorage.getItem(NICKNAME_STORAGE_KEY)
    if (!rawUser) return null

    const parsedUser = JSON.parse(rawUser) as StoredUser

    if (parsedUser.type === 'authenticated') {
      return readStoredAuthenticatedUser(parsedUser)
    }

    if (parsedUser.type !== 'anonymous') {
      return null
    }

    return readStoredAnonymousUser(parsedUser)
  } catch (error) {
    console.warn('Failed to read coFFFFFe user from localStorage.', error)
    return null
  }
}

function readStoredAnonymousUser(parsedUser: StoredUser): AnonymousUser | null {
  if (
    typeof parsedUser.nickname !== 'string' ||
    typeof parsedUser.animal !== 'string' ||
    !isNicknameAnimal(parsedUser.animal)
  ) {
    return null
  }

  return {
    type: 'anonymous',
    anonymousId: typeof parsedUser.anonymousId === 'string'
      ? parsedUser.anonymousId
      : createAnonymousId(),
    nickname: parsedUser.nickname,
    animal: parsedUser.animal,
  }
}

function readStoredAuthenticatedUser(parsedUser: StoredUser): AuthenticatedUser | null {
  if (
    typeof parsedUser.id !== 'string' ||
    typeof parsedUser.kakaoId !== 'string' ||
    typeof parsedUser.siteNickname !== 'string' ||
    typeof parsedUser.siteAnimal !== 'string' ||
    !isNicknameAnimal(parsedUser.siteAnimal) ||
    typeof parsedUser.kakaoNickname !== 'string'
  ) {
    return null
  }

  const kakaoProfileImageUrl = typeof parsedUser.kakaoProfileImageUrl === 'string'
    ? parsedUser.kakaoProfileImageUrl
    : typeof parsedUser.profileImageUrl === 'string' ? parsedUser.profileImageUrl : undefined

  return {
    type: 'authenticated',
    id: parsedUser.id,
    kakaoId: parsedUser.kakaoId,
    nickname: parsedUser.siteNickname,
    siteNickname: parsedUser.siteNickname,
    siteAnimal: parsedUser.siteAnimal,
    kakaoNickname: parsedUser.kakaoNickname,
    kakaoProfileImageUrl,
    profileImageUrl: kakaoProfileImageUrl,
    isAdmin: parsedUser.isAdmin === true,
  }
}

function saveUser(user: User): void {
  try {
    window.localStorage.setItem(NICKNAME_STORAGE_KEY, JSON.stringify(user))
  } catch (error) {
    console.warn('Failed to save coFFFFFe user to localStorage.', error)
  }
}

async function regenerateAuthenticatedNickname(currentUser: AuthenticatedUser): Promise<void> {
  try {
    const response = await fetch('/api/auth/me', { method: 'PATCH' })
    if (!response.ok) throw new Error('Failed to regenerate nickname')

    const data = await response.json() as { siteNickname?: unknown; siteAnimal?: unknown }
    if (
      typeof data.siteNickname !== 'string' ||
      typeof data.siteAnimal !== 'string' ||
      !isNicknameAnimal(data.siteAnimal)
    ) {
      throw new Error('Invalid regenerated nickname payload')
    }

    setUserSnapshot({
      ...currentUser,
      nickname: data.siteNickname,
      siteNickname: data.siteNickname,
      siteAnimal: data.siteAnimal,
    })
  } catch (error) {
    console.warn('Failed to regenerate authenticated nickname. / 로그인 사용자 닉네임 재생성 실패.', error)
  }
}
