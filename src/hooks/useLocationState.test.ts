import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useLocationState } from './useLocationState'

function mockGeolocationSuccess(lat: number, lng: number) {
  Object.defineProperty(navigator, 'geolocation', {
    value: {
      getCurrentPosition: vi.fn((success) =>
        success({ coords: { latitude: lat, longitude: lng } } as GeolocationPosition),
      ),
    },
    configurable: true,
  })
}

function mockGeolocationError(code: number) {
  Object.defineProperty(navigator, 'geolocation', {
    value: {
      getCurrentPosition: vi.fn((_success, error) =>
        error({
          code,
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
          message: '',
        } as GeolocationPositionError),
      ),
    },
    configurable: true,
  })
}

function mockPermissionsQuery(state: PermissionState) {
  Object.defineProperty(navigator, 'permissions', {
    value: {
      query: vi.fn().mockResolvedValue({ state }),
    },
    configurable: true,
  })
}

describe('useLocationState', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('위치 권한이 granted이면 locationRequestId가 증가한다', async () => {
    mockPermissionsQuery('granted')

    const { result } = renderHook(() => useLocationState())

    await waitFor(() => {
      expect(result.current.locationRequestId).toBe(1)
    })
    expect(result.current.locationPermissionModalOpen).toBe(false)
  })

  it('위치 권한이 prompt이면 locationPermissionModalOpen이 true가 된다', async () => {
    mockPermissionsQuery('prompt')

    const { result } = renderHook(() => useLocationState())

    await waitFor(() => {
      expect(navigator.permissions.query).toHaveBeenCalledWith({ name: 'geolocation' })
    })
    expect(result.current.locationPermissionModalOpen).toBe(false)
    expect(result.current.locationRequestId).toBe(0)
  })

  it('권한 API가 없어도 접속만으로 모달을 열지 않는다', async () => {
    Object.defineProperty(navigator, 'permissions', {
      value: undefined,
      configurable: true,
    })

    const { result } = renderHook(() => useLocationState())

    expect(result.current.locationPermissionModalOpen).toBe(false)
    expect(result.current.locationRequestId).toBe(0)
  })

  it('requestUserLocation 성공 시 userLocation이 설정되고 isRequestingLocation이 false로 돌아온다', async () => {
    mockPermissionsQuery('denied')
    mockGeolocationSuccess(37.3219, 126.8309)

    const { result } = renderHook(() => useLocationState())

    act(() => {
      result.current.requestUserLocation()
    })

    await waitFor(() => {
      expect(result.current.userLocation).toEqual({ lat: 37.3219, lng: 126.8309 })
    })
    expect(result.current.isRequestingLocation).toBe(false)
    expect(result.current.locationRequestId).toBe(1)
  })

  it('requestUserLocation 실패(PERMISSION_DENIED) 시 locationPermissionError가 설정된다', async () => {
    mockPermissionsQuery('denied')
    mockGeolocationError(1) // PERMISSION_DENIED = 1

    const { result } = renderHook(() => useLocationState())

    act(() => {
      result.current.requestUserLocation()
    })

    await waitFor(() => {
      expect(result.current.locationPermissionError).toContain('위치 권한이 거부됐어요')
    })
    expect(result.current.isRequestingLocation).toBe(false)
    expect(result.current.userLocation).toBeNull()
  })
})
