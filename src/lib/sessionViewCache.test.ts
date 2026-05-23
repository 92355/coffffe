import { describe, it, expect, beforeEach } from 'vitest'
import {
  hasTrackedView,
  markViewTracked,
  resetSessionViewCacheForTests,
  trackedViewCount,
} from './sessionViewCache'

describe('sessionViewCache', () => {
  beforeEach(() => {
    resetSessionViewCacheForTests()
  })

  it('starts empty', () => {
    expect(trackedViewCount()).toBe(0)
  })

  it('records and detects a tracked cafe id', () => {
    expect(hasTrackedView('cafe-1')).toBe(false)
    markViewTracked('cafe-1')
    expect(hasTrackedView('cafe-1')).toBe(true)
  })

  it('does not double-count when same id is marked twice', () => {
    markViewTracked('cafe-1')
    markViewTracked('cafe-1')
    expect(trackedViewCount()).toBe(1)
  })

  it('tracks multiple distinct cafes', () => {
    markViewTracked('cafe-1')
    markViewTracked('cafe-2')
    expect(trackedViewCount()).toBe(2)
    expect(hasTrackedView('cafe-1')).toBe(true)
    expect(hasTrackedView('cafe-2')).toBe(true)
    expect(hasTrackedView('cafe-3')).toBe(false)
  })

  it('reset clears all entries', () => {
    markViewTracked('cafe-1')
    markViewTracked('cafe-2')
    resetSessionViewCacheForTests()
    expect(trackedViewCount()).toBe(0)
    expect(hasTrackedView('cafe-1')).toBe(false)
  })
})
