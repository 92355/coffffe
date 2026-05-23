import { describe, it, expect } from 'vitest'
import { checkReviewRateLimit } from './footprintRateLimit'

const NOW = new Date('2026-05-23T12:00:00Z')

describe('checkReviewRateLimit', () => {
  it('allows when no previous submission exists', () => {
    const result = checkReviewRateLimit({
      lastCreatedAt: null,
      windowHours: 24,
      now: NOW,
    })

    expect(result).toEqual({ allowed: true, retryAfterSeconds: 0 })
  })

  it('blocks when last submission is within the window (23h ago)', () => {
    const lastCreatedAt = new Date(NOW.getTime() - 23 * 60 * 60 * 1000)
    const result = checkReviewRateLimit({ lastCreatedAt, windowHours: 24, now: NOW })

    expect(result.allowed).toBe(false)
    // 남은 시간 약 1시간 = 3600초
    expect(result.retryAfterSeconds).toBe(3600)
  })

  it('allows exactly at the window boundary (24h elapsed)', () => {
    const lastCreatedAt = new Date(NOW.getTime() - 24 * 60 * 60 * 1000)
    const result = checkReviewRateLimit({ lastCreatedAt, windowHours: 24, now: NOW })

    expect(result.allowed).toBe(true)
    expect(result.retryAfterSeconds).toBe(0)
  })

  it('allows just after the window (24h + 1s elapsed)', () => {
    const lastCreatedAt = new Date(NOW.getTime() - (24 * 60 * 60 * 1000 + 1000))
    const result = checkReviewRateLimit({ lastCreatedAt, windowHours: 24, now: NOW })

    expect(result.allowed).toBe(true)
  })

  it('rounds up sub-second remainders to at least 1 second', () => {
    const lastCreatedAt = new Date(NOW.getTime() - (24 * 60 * 60 * 1000 - 500))
    const result = checkReviewRateLimit({ lastCreatedAt, windowHours: 24, now: NOW })

    expect(result.allowed).toBe(false)
    expect(result.retryAfterSeconds).toBe(1)
  })

  it('respects custom windowHours', () => {
    const lastCreatedAt = new Date(NOW.getTime() - 30 * 60 * 1000) // 30분 전
    const result = checkReviewRateLimit({ lastCreatedAt, windowHours: 1, now: NOW })

    expect(result.allowed).toBe(false)
    expect(result.retryAfterSeconds).toBe(30 * 60)
  })
})
