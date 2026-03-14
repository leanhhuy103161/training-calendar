import { describe, it, expect } from 'vitest'
import { cn } from './index'

describe('cn', () => {
  it('joins class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('filters out falsy values', () => {
    expect(cn('foo', false, undefined, null, 'bar')).toBe('foo bar')
  })

  it('returns empty string when all values are falsy', () => {
    expect(cn(false, undefined, null)).toBe('')
  })

  it('handles a single class', () => {
    expect(cn('only')).toBe('only')
  })
})
