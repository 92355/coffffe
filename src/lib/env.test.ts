import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getRequiredEnv } from './env'

const TEST_ENV_KEY = 'COFFFFE_TEST_REQUIRED_ENV'

describe('getRequiredEnv', () => {
  let originalValue: string | undefined

  beforeEach(() => {
    originalValue = process.env[TEST_ENV_KEY]
  })

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env[TEST_ENV_KEY]
    } else {
      process.env[TEST_ENV_KEY] = originalValue
    }
  })

  it('환경 변수가 존재하면 해당 값을 반환한다', () => {
    process.env[TEST_ENV_KEY] = 'configured'
    expect(getRequiredEnv(TEST_ENV_KEY)).toBe('configured')
  })

  it('환경 변수가 undefined이면 키 이름을 포함한 에러를 던진다', () => {
    delete process.env[TEST_ENV_KEY]
    expect(() => getRequiredEnv(TEST_ENV_KEY)).toThrow(TEST_ENV_KEY)
  })

  it('환경 변수가 빈 문자열이면 에러를 던진다', () => {
    process.env[TEST_ENV_KEY] = ''
    expect(() => getRequiredEnv(TEST_ENV_KEY)).toThrow(TEST_ENV_KEY)
  })
})
