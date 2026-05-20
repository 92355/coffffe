'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { generateNickname, isNicknameAnimal, NICKNAME_STORAGE_KEY, type NicknameAnimal } from '@/lib/nickname'

interface AnonymousUser {
  type: 'anonymous'
  nickname: string
  animal: NicknameAnimal
}

export type User = AnonymousUser

interface UserState {
  user: User | null
  regenerateNickname: () => void
}

interface StoredUser {
  type?: string
  nickname?: unknown
  animal?: unknown
}

let cachedUser: User | null | undefined
const userStoreListeners = new Set<() => void>()

export function useUser(): UserState {
  const user = useSyncExternalStore(subscribeToUserStorage, getUserSnapshot, getServerUserSnapshot)
  const regenerateNickname = useCallback(() => {
    setUserSnapshot(createAnonymousUser())
  }, [])

  return { user, regenerateNickname }
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
    nickname: generatedNickname.nickname,
    animal: generatedNickname.animal,
  }
}

function readStoredUser(): User | null {
  try {
    const rawUser = window.localStorage.getItem(NICKNAME_STORAGE_KEY)
    if (!rawUser) return null

    const parsedUser = JSON.parse(rawUser) as StoredUser

    if (
      parsedUser.type !== 'anonymous' ||
      typeof parsedUser.nickname !== 'string' ||
      typeof parsedUser.animal !== 'string' ||
      !isNicknameAnimal(parsedUser.animal)
    ) {
      return null
    }

    return {
      type: 'anonymous',
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
