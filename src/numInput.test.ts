import { describe, expect, it } from 'vitest'
import { sanitizeDraft, parseDraft, toEditDraft, formatGrouped } from './numInput'

describe('numInput', () => {
  it('strips leading zeros and formats money', () => {
    expect(sanitizeDraft('02000')).toBe('2000')
    expect(parseDraft('2,000')).toBe(2000)
    expect(toEditDraft(2000)).toBe('2000')
    expect(formatGrouped(2000, 'money')).toBe('2,000')
    expect(formatGrouped(25_000_000, 'money')).toBe('25,000,000')
  })
})
