import { describe, test, expect } from 'vitest'
import { formatUserAgent } from './userAgent.js'

describe('formatUserAgent', () => {
  test('formats a product app UA', () => {
    expect(formatUserAgent('Drifttt/1.0.0 (android)')).toEqual({
      kind: 'product',
      label: 'Drifttt 1.0.0 · android',
      platform: 'android',
      isMobile: true
    })
  })

  test('flags desktop platforms as not mobile', () => {
    expect(formatUserAgent('Drifttt/1.2.3 (web)')).toMatchObject({
      kind: 'product',
      label: 'Drifttt 1.2.3 · web',
      isMobile: false
    })
  })

  test('handles a multi-word product name', () => {
    expect(formatUserAgent('Maria App Studio/2.0 (ios)')).toMatchObject({
      kind: 'product',
      label: 'Maria App Studio 2.0 · ios',
      isMobile: true
    })
  })

  test('keeps a browser UA as raw text', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    expect(formatUserAgent(ua)).toMatchObject({ kind: 'browser', label: ua, isMobile: false })
  })

  test('does not mistake a short browser UA for a product', () => {
    expect(formatUserAgent('Mozilla/5.0 (Windows NT 10.0)')).toMatchObject({ kind: 'browser' })
  })

  test('detects a mobile browser UA', () => {
    expect(
      formatUserAgent('Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120 Mobile')
    ).toMatchObject({ kind: 'browser', isMobile: true })
  })

  test('shows nothing for machine agents', () => {
    expect(formatUserAgent('node')).toBeNull()
    expect(formatUserAgent('node/20.11.0')).toBeNull()
    expect(formatUserAgent('curl/8.5.0')).toBeNull()
  })

  test('shows nothing when there is no UA', () => {
    expect(formatUserAgent('')).toBeNull()
    expect(formatUserAgent('   ')).toBeNull()
    expect(formatUserAgent(null)).toBeNull()
    expect(formatUserAgent(undefined)).toBeNull()
  })
})
