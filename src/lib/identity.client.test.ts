import { describe, it, expect, beforeEach } from 'vitest'
import { getAnonymousId, attachTo } from './identity.client'
import { NICKNAME_STORAGE_KEY } from './nickname'

beforeEach(() => {
  localStorage.clear()
})

describe('getAnonymousId', () => {
  it('localStorage에 사용자 없으면 null 반환', () => {
    expect(getAnonymousId()).toBeNull()
  })

  it('익명 사용자의 anonymousId 반환', () => {
    localStorage.setItem(NICKNAME_STORAGE_KEY, JSON.stringify({ type: 'anonymous', anonymousId: 'test-uuid-123' }))
    expect(getAnonymousId()).toBe('test-uuid-123')
  })

  it('인증 사용자의 id를 auth: 접두어와 함께 반환', () => {
    localStorage.setItem(NICKNAME_STORAGE_KEY, JSON.stringify({ type: 'authenticated', id: 'kakao-user-456' }))
    expect(getAnonymousId()).toBe('auth:kakao-user-456')
  })

  it('anonymousId 우선 — id보다', () => {
    localStorage.setItem(NICKNAME_STORAGE_KEY, JSON.stringify({ anonymousId: 'anon-id', id: 'auth-id' }))
    expect(getAnonymousId()).toBe('anon-id')
  })

  it('빈 문자열 anonymousId는 null 반환', () => {
    localStorage.setItem(NICKNAME_STORAGE_KEY, JSON.stringify({ anonymousId: '' }))
    expect(getAnonymousId()).toBeNull()
  })

  it('잘못된 JSON은 null 반환', () => {
    localStorage.setItem(NICKNAME_STORAGE_KEY, 'not-json')
    expect(getAnonymousId()).toBeNull()
  })
})

describe('attachTo', () => {
  it('anonymousId가 있으면 헤더에 추가', () => {
    localStorage.setItem(NICKNAME_STORAGE_KEY, JSON.stringify({ anonymousId: 'test-id' }))
    const headers = attachTo(new Headers())
    expect(headers.get('x-anonymous-id')).toBe('test-id')
  })

  it('이미 헤더에 있으면 덮어쓰지 않음', () => {
    localStorage.setItem(NICKNAME_STORAGE_KEY, JSON.stringify({ anonymousId: 'test-id' }))
    const headers = new Headers({ 'x-anonymous-id': 'existing-id' })
    attachTo(headers)
    expect(headers.get('x-anonymous-id')).toBe('existing-id')
  })

  it('anonymousId 없으면 헤더 미추가', () => {
    const headers = attachTo(new Headers())
    expect(headers.get('x-anonymous-id')).toBeNull()
  })
})
