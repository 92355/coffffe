import { useCallback, useEffect, useState } from 'react'
import type { LocationPoint } from '@/types/location'

const GEOLOCATION_TIMEOUT_MS = 10000
const GEOLOCATION_MAXIMUM_AGE_MS = 60000

export interface LocationState {
  userLocation: LocationPoint | null
  locationPermissionModalOpen: boolean
  isRequestingLocation: boolean
  locationPermissionError: string | null
  locationRequestId: number
  setUserLocation: (location: LocationPoint | null) => void
  setLocationPermissionModalOpen: (open: boolean) => void
  setLocationPermissionError: (error: string | null) => void
  triggerLocationRefresh: () => void
  requestUserLocation: () => void
}

export function useLocationState(): LocationState {
  const [userLocation, setUserLocation] = useState<LocationPoint | null>(null)
  const [locationPermissionModalOpen, setLocationPermissionModalOpen] = useState(false)
  const [isRequestingLocation, setIsRequestingLocation] = useState(false)
  const [locationPermissionError, setLocationPermissionError] = useState<string | null>(null)
  const [locationRequestId, setLocationRequestId] = useState(0)

  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationPermissionError('이 기기에서는 위치 기능을 사용할 수 없어요.')
      return
    }

    setIsRequestingLocation(true)
    setLocationPermissionError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLocationPermissionModalOpen(false)
        setIsRequestingLocation(false)
        setLocationRequestId((current) => current + 1)
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? '위치 권한이 거부됐어요. 브라우저 설정에서 위치 권한을 허용한 뒤 다시 눌러주세요.'
          : '현재 위치를 확인하지 못했어요. 잠시 후 다시 시도해주세요.'

        setLocationPermissionError(message)
        setIsRequestingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: GEOLOCATION_TIMEOUT_MS,
        maximumAge: GEOLOCATION_MAXIMUM_AGE_MS,
      },
    )
  }, [])

  useEffect(() => {
    if (!navigator.permissions) {
      window.setTimeout(() => setLocationPermissionModalOpen(true), 0)
      return
    }

    void navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        setLocationRequestId((current) => current + 1)
      } else if (result.state === 'prompt') {
        setLocationPermissionModalOpen(true)
      }
      // denied → 모달 안 띄움
    })
  }, [])

  const triggerLocationRefresh = useCallback(() => {
    setLocationRequestId((current) => current + 1)
  }, [])

  return {
    userLocation,
    locationPermissionModalOpen,
    isRequestingLocation,
    locationPermissionError,
    locationRequestId,
    setUserLocation,
    setLocationPermissionModalOpen,
    setLocationPermissionError,
    triggerLocationRefresh,
    requestUserLocation,
  }
}
