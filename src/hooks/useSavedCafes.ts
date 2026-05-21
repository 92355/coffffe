'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { User } from '@/hooks/useUser'

const SAVED_CAFES_STORAGE_KEY = 'coffffe_saved_cafes'

interface SavedCafesState {
  favoriteCafeIds: string[]
  favoriteCafeIdSet: Set<string>
  toggleFavoriteCafe: (cafeId: string) => Promise<void>
  favoriteError: string | null
}

interface FavoritesResponse {
  cafeIds?: unknown
}

export function useSavedCafes(user: User | null): SavedCafesState {
  const [favoriteCafeIds, setFavoriteCafeIds] = useState<string[]>([])
  const [favoriteError, setFavoriteError] = useState<string | null>(null)
  const authenticated = user?.type === 'authenticated'
  const authenticatedUserId = user?.type === 'authenticated' ? user.id : null

  useEffect(() => {
    let active = true

    async function loadFavorites(): Promise<void> {
      setFavoriteError(null)

      if (!authenticated) {
        setFavoriteCafeIds(readLocalFavorites())
        return
      }

      try {
        const response = await fetch('/api/me/favorites', { cache: 'no-store' })
        if (!response.ok) throw new Error('Failed to load favorites')

        const data = await response.json() as FavoritesResponse
        if (!active) return

        setFavoriteCafeIds(parseFavoriteCafeIds(data.cafeIds))
      } catch (error) {
        console.warn('Failed to load favorite cafes. / 즐겨찾기 카페 로드 실패.', error)
        if (!active) return

        setFavoriteError('저장 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
      }
    }

    void loadFavorites()

    return () => {
      active = false
    }
  }, [authenticated, authenticatedUserId])

  const toggleFavoriteCafe = useCallback(async (cafeId: string) => {
    const favorite = favoriteCafeIds.includes(cafeId)
    const nextFavoriteCafeIds = favorite
      ? favoriteCafeIds.filter((id) => id !== cafeId)
      : [cafeId, ...favoriteCafeIds]

    setFavoriteCafeIds(nextFavoriteCafeIds)
    setFavoriteError(null)

    if (!authenticated) {
      saveLocalFavorites(nextFavoriteCafeIds)
      return
    }

    try {
      const response = await fetch('/api/me/favorites', {
        method: favorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cafeId }),
      })

      if (!response.ok) throw new Error('Failed to save favorite')
    } catch (error) {
      console.warn('Failed to save favorite cafe. / 즐겨찾기 저장 실패.', error)
      setFavoriteCafeIds(favoriteCafeIds)
      setFavoriteError('저장하지 못했어요. 네트워크와 로그인 상태를 확인해 주세요.')
    }
  }, [authenticated, favoriteCafeIds])

  const favoriteCafeIdSet = useMemo(() => new Set(favoriteCafeIds), [favoriteCafeIds])

  return { favoriteCafeIds, favoriteCafeIdSet, toggleFavoriteCafe, favoriteError }
}

function readLocalFavorites(): string[] {
  try {
    const rawValue = window.localStorage.getItem(SAVED_CAFES_STORAGE_KEY)
    if (!rawValue) return []

    return parseFavoriteCafeIds(JSON.parse(rawValue))
  } catch (error) {
    console.warn('Failed to read local favorite cafes. / 로컬 즐겨찾기 읽기 실패.', error)
    return []
  }
}

function saveLocalFavorites(cafeIds: string[]): void {
  try {
    window.localStorage.setItem(SAVED_CAFES_STORAGE_KEY, JSON.stringify(cafeIds))
  } catch (error) {
    console.warn('Failed to save local favorite cafes. / 로컬 즐겨찾기 저장 실패.', error)
  }
}

function parseFavoriteCafeIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return Array.from(new Set(value.filter((item): item is string => typeof item === 'string' && item.length > 0)))
}
