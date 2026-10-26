/** Shared numeric input helpers — strip leading zeros, group thousands on blur. */

export type NumFormat = 'money' | 'number' | 'percent'

/** Keep only digits / one dot; drop leading zeros (keep a single 0 before decimals). */
export function sanitizeDraft(raw: string, allowDecimal = true): string {
  let s = String(raw ?? '').replace(/,/g, '').replace(/[^\d.]/g, '')
  if (!allowDecimal) {
    s = s.replace(/\./g, '')
  } else {
    const i = s.indexOf('.')
    if (i !== -1) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '')
  }
  if (s === '' || s === '.') return s
  if (s.startsWith('.')) s = `0${s}`
  const dot = s.indexOf('.')
  if (dot === -1) return s.replace(/^0+(?=\d)/, '')
  const intPart = s.slice(0, dot).replace(/^0+(?=\d)/, '') || '0'
  return `${intPart}${s.slice(dot)}`
}

export function parseDraft(draft: string): number {
  const t = String(draft ?? '').trim()
  if (t === '' || t === '.' || t === '-') return 0
  const n = Number(t.replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

/** Plain editable string (no commas) when the field gains focus. */
export function toEditDraft(n: number, allowDecimal = true): string {
  if (!Number.isFinite(n)) return ''
  if (n === 0) return ''
  if (!allowDecimal) return String(Math.round(n))
  const rounded = Math.round(n * 1e6) / 1e6
  if (Number.isInteger(rounded)) return String(rounded)
  return String(rounded)
}

/** Grouped display when blurred. Money/number get thousand separators; percents stay plain. */
export function formatGrouped(n: number, format: NumFormat = 'number'): string {
  if (!Number.isFinite(n)) return ''
  if (format === 'percent') {
    const rounded = Math.round(n * 1e6) / 1e6
    return String(rounded)
  }
  const maxFrac = format === 'money' ? 2 : 4
  return n.toLocaleString('en-US', {
    maximumFractionDigits: maxFrac,
    minimumFractionDigits: 0,
  })
}
