import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMapViewUI } from './useMapViewUI'

describe('useMapViewUI', () => {
  it('profileMenuOpen이 true인 상태에서 ref 외부 포인터 다운 시 false가 된다', () => {
    const { result } = renderHook(() => useMapViewUI())

    act(() => { result.current.setProfileMenuOpen(true) })
    expect(result.current.profileMenuOpen).toBe(true)

    act(() => {
      document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    })

    expect(result.current.profileMenuOpen).toBe(false)
  })

  it('profileMenuOpen이 true인 상태에서 Esc 키 다운 시 false가 된다', () => {
    const { result } = renderHook(() => useMapViewUI())

    act(() => { result.current.setProfileMenuOpen(true) })
    expect(result.current.profileMenuOpen).toBe(true)

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    })

    expect(result.current.profileMenuOpen).toBe(false)
  })
})
