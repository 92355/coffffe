import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReportState } from './useReportState'

describe('useReportState', () => {
  it('openNewPlaceReport 호출 시 reportSheetOpen이 true, 타입이 new_place가 된다', () => {
    const setMapPickMode = vi.fn()
    const { result } = renderHook(() => useReportState(setMapPickMode, false))

    act(() => { result.current.openNewPlaceReport() })

    expect(result.current.reportSheetOpen).toBe(true)
    expect(result.current.reportInitialType).toBe('new_place')
    expect(result.current.reportInitialCafe).toBeNull()
  })

  it('handleStartMapPick 호출 시 reportSheetOpen이 false가 되고 setMapPickMode(true)가 호출된다', () => {
    const setMapPickMode = vi.fn()
    const { result } = renderHook(() => useReportState(setMapPickMode, false))

    act(() => { result.current.openNewPlaceReport() })
    expect(result.current.reportSheetOpen).toBe(true)

    act(() => { result.current.handleStartMapPick() })

    expect(result.current.reportSheetOpen).toBe(false)
    expect(setMapPickMode).toHaveBeenCalledWith(true)
  })
})
