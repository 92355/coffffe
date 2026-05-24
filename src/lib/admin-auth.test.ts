import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createAdminSessionToken, isAdminSessionValue } from './admin-auth'

const ADMIN_SECRET_KEY = 'ADMIN_SECRET'
const ORIGINAL_NOW = new Date('2026-05-24T12:00:00Z')

describe('admin session auth', () => {
  let originalAdminSecret: string | undefined

  beforeEach(() => {
    originalAdminSecret = process.env[ADMIN_SECRET_KEY]
    process.env[ADMIN_SECRET_KEY] = 'test-admin-secret'
    vi.useFakeTimers()
    vi.setSystemTime(ORIGINAL_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
    if (originalAdminSecret === undefined) {
      delete process.env[ADMIN_SECRET_KEY]
    } else {
      process.env[ADMIN_SECRET_KEY] = originalAdminSecret
    }
  })

  it('서명된 관리자 세션 토큰은 통과한다', () => {
    const token = createAdminSessionToken()

    expect(isAdminSessionValue(token)).toBe(true)
  })

  it('ADMIN_SECRET 원문 값은 세션으로 인정하지 않는다', () => {
    expect(isAdminSessionValue('test-admin-secret')).toBe(false)
  })

  it('ADMIN_SECRET이 없으면 세션 검증은 false를 반환한다', () => {
    const token = createAdminSessionToken()

    delete process.env[ADMIN_SECRET_KEY]

    expect(isAdminSessionValue(token)).toBe(false)
  })

  it('payload가 변조된 토큰은 거부한다', () => {
    const token = createAdminSessionToken()
    const [, signature] = token.split('.')
    const tamperedPayload = Buffer.from(JSON.stringify({
      purpose: 'admin',
      expiresAt: ORIGINAL_NOW.getTime() + 60 * 60 * 1000,
      extra: true,
    }), 'utf8').toString('base64url')

    expect(isAdminSessionValue(`${tamperedPayload}.${signature}`)).toBe(false)
  })

  it('만료된 관리자 세션 토큰은 거부한다', () => {
    const token = createAdminSessionToken()

    vi.setSystemTime(new Date(ORIGINAL_NOW.getTime() + 9 * 60 * 60 * 1000))

    expect(isAdminSessionValue(token)).toBe(false)
  })
})
