import { describe, test, expect } from 'vitest'
import {
  productFromInboxName,
  productsFromInboxNames,
  productInitials
} from './products.js'

describe('productFromInboxName', () => {
  test('maps every Drifttt inbox to the Drifttt product', () => {
    for (const inbox of ['Drifttt App', 'Drifttt Support', 'Drifttt']) {
      expect(productFromInboxName(inbox)).toMatchObject({ name: 'Drifttt' })
    }
  })

  test('maps the Maria App Studio inbox to Maria App Studio', () => {
    expect(productFromInboxName('Maria App Studio Support')).toMatchObject({
      name: 'Maria App Studio'
    })
  })

  test('gives known products a bundled icon', () => {
    expect(productFromInboxName('Drifttt Support').icon).toBeTruthy()
    expect(productFromInboxName('Maria App Studio Support').icon).toBeTruthy()
  })

  test('matches on leading words only, never mid-name', () => {
    expect(productFromInboxName('Not Drifttt Support')).toMatchObject({ name: 'Not Drifttt' })
    expect(productFromInboxName('Driftttastic Support')).toMatchObject({ name: 'Driftttastic' })
  })

  test('drops a trailing Support/App word from an unknown inbox', () => {
    expect(productFromInboxName('Acme Cloud Support')).toMatchObject({ name: 'Acme Cloud' })
    expect(productFromInboxName('Acme Cloud App')).toMatchObject({ name: 'Acme Cloud' })
  })

  test('gives unknown products a monogram instead of an icon', () => {
    expect(productFromInboxName('Acme Cloud Support')).toMatchObject({
      icon: null,
      initials: 'AC'
    })
  })

  test('keeps the name when it is only the trailing word', () => {
    expect(productFromInboxName('Support')).toMatchObject({ name: 'Support' })
  })

  test('normalises whitespace and casing of the suffix', () => {
    expect(productFromInboxName('  Acme   Cloud   SUPPORT ')).toMatchObject({ name: 'Acme Cloud' })
  })

  test('returns null when there is no inbox name', () => {
    expect(productFromInboxName('')).toBeNull()
    expect(productFromInboxName('   ')).toBeNull()
    expect(productFromInboxName(null)).toBeNull()
    expect(productFromInboxName(undefined)).toBeNull()
  })
})

describe('productsFromInboxNames', () => {
  test('dedupes the inboxes of several conversations into one product each', () => {
    const products = productsFromInboxNames([
      'Drifttt App',
      'Drifttt Support',
      'Maria App Studio Support',
      'Drifttt App'
    ])
    expect(products.map((product) => product.name)).toEqual(['Drifttt', 'Maria App Studio'])
  })

  test('keeps the order the inboxes first appear in', () => {
    const products = productsFromInboxNames(['Acme Cloud Support', 'Drifttt App'])
    expect(products.map((product) => product.name)).toEqual(['Acme Cloud', 'Drifttt'])
  })

  test('skips conversations without an inbox name', () => {
    expect(productsFromInboxNames(['Drifttt App', null, undefined, ''])).toHaveLength(1)
  })

  test('returns an empty list for no input', () => {
    expect(productsFromInboxNames([])).toEqual([])
    expect(productsFromInboxNames(undefined)).toEqual([])
  })
})

describe('productInitials', () => {
  test('takes the first letter of the first two words', () => {
    expect(productInitials('Maria App Studio')).toBe('MA')
    expect(productInitials('Drifttt')).toBe('D')
  })
})
