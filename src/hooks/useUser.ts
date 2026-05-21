'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { generateNickname, isNicknameAnimal, NICKNAME_STORAGE_KEY, type NicknameAnimal } from '@/lib/nickname'

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
  profileImageUrl?: string
}

export type User = AnonymousUser | AuthenticatedUser

interface UserState {
  user: User | null
  regenerateNickname: () => void
  loginWithKakao: () => void
  logout: () => Promise<void>
}

interface StoredUser {
  type?: string
  anonymousId?: unknown
  nickname?: unknown
  animal?: unknown
}

interface MeResponse {
  user?: {
    type?: string
    id?: unknown
    kakaoId?: unknown
    nickname?: unknown
    profileImageUrl?: unknown
  } | null
}

let cachedUser: User | null | undefined
const userStoreListeners = new Set<() => void>()

export function useUser(): UserState {
  const user = useSyncExternalStore(subscribeToUserStorage, getUserSnapshot, getServerUserSnapshot)
  const regenerateNickname = useCallback(() => {
    setUserSnapshot(createAnonymousUser())
  }, [])
  const loginWithKakao = useCallback(() => {
    window.location.href = '/api/auth/kakao/start'
  }, [])
  const logout = useCallback(async () => {
    const response = await fetch('/api/auth/logout', { method: 'POST' })
    if (!response.ok) throw new Error('Failed to logout')

    setUserSnapshot(readStoredUser() ?? createAnonymousUser())
  }, [])

  useEffect(() => {
    let active = true

    async function syncAuthenticatedUser(): Promise<void> {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' })
        if (!response.ok) return

        const data = await response.json() as MeResponse
        const authenticatedUser = parseAuthenticatedUser(data)
        if (!active || !authenticatedUser) return

        setUserSnapshot(authenticatedUser)
      } catch (error) {
        console.warn('Failed to sync Kakao user. / 카카오 사용자 동기화에 실패했습니다.', error)
      }
    }

    void syncAuthenticatedUser()

    return () => {
      active = false
    }
  }, [])

  return { user, regenerateNickname, loginWithKakao, logout }
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

function createAnonymousUser(): User {
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

  return {
    type: 'authenticated',
    id: user.id,
    kakaoId: user.kakaoId,
    nickname: user.nickname,
    profileImageUrl: typeof user.profileImageUrl === 'string' ? user.profileImageUrl : undefined,
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

    if (parsedUser.type !== 'anonymous') {
      return null
    }

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
  } catch (error) {
    console.warn('Failed to read coFFFFFe user from localStorage.', error)
    return null
  }
}

function saveUser(user: User): void {
  try {
    window.localStorage.setItem(NICKNAME_STORAGE_KEY, JSON.stringify(user))
  } catch (error) {
    console.warn('Failed to save coFFFFFe user to localStorage.', error)
  }
}
