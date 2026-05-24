import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createSessionToken, type UserSession } from './user-auth'

const ADMIN_SECRET_KEY = 'ADMIN_SECRET'
const KAKAO_SESSION_SECRET_KEY = 'KAKAO_SESSION_SECRET'

const TEST_SESSION: UserSession = {
  userId: 'user-1',
  kakaoId: '12345',
  nickname: '테스트 유저',
}

describe('user session auth', () => {
  let originalAdminSecret: string | undefined
  let originalKakaoSessionSecret: string | undefined

  beforeEach(() => {
    originalAdminSecret = process.env[ADMIN_SECRET_KEY]
    originalKakaoSessionSecret = process.env[KAKAO_SESSION_SECRET_KEY]
  })

  afterEach(() => {
    if (originalAdminSecret === undefined) {
      delete process.env[ADMIN_SECRET_KEY]
    } else {
      process.env[ADMIN_SECRET_KEY] = originalAdminSecret
    }

    if (originalKakaoSessionSecret === undefined) {
      delete process.env[KAKAO_SESSION_SECRET_KEY]
    } else {
      process.env[KAKAO_SESSION_SECRET_KEY] = originalKakaoSessionSecret
    }
  })

  it('KAKAO_SESSION_SECRET이 있으면 사용자 세션 토큰을 만든다', () => {
    process.env[KAKAO_SESSION_SECRET_KEY] = 'test-kakao-session-secret'

    expect(createSessionToken(TEST_SESSION)).toMatch(/^[^.]+\.[^.]+$/)
  })

  it('ADMIN_SECRET만 있으면 사용자 세션 토큰을 만들지 않는다', () => {
    process.env[ADMIN_SECRET_KEY] = 'test-admin-secret'
    delete process.env[KAKAO_SESSION_SECRET_KEY]

    expect(() => createSessionToken(TEST_SESSION)).toThrow(KAKAO_SESSION_SECRET_KEY)
  })
})
