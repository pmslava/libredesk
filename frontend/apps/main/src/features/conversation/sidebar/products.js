/**
 * Products a contact has written to, derived from the inbox names of their conversations.
 *
 * An inbox name maps to a product by its leading words, so "Drifttt App" and "Drifttt Support"
 * are both the Drifttt product. An inbox we don't know keeps its own name minus a trailing
 * "Support"/"App" word and gets an initials monogram instead of a bundled icon.
 */
import driftttIcon from '@/assets/products/drifttt.svg'
import mariaAppStudioIcon from '@/assets/products/maria-app-studio.svg'

// Longest name first: matching is by leading words, so a more specific product must win.
export const PRODUCTS = [
  { name: 'Maria App Studio', icon: mariaAppStudioIcon },
  { name: 'Drifttt', icon: driftttIcon }
]

// Inbox names are usually "<product> Support" or "<product> App"; the suffix is not the product.
const TRAILING_INBOX_WORD = /\s(support|app)$/i

const normalize = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')

const leadsWith = (inboxName, productName) => {
  const inbox = inboxName.toLowerCase()
  const product = productName.toLowerCase()
  return inbox === product || inbox.startsWith(product + ' ')
}

/** Initials of the first two words, e.g. "Acme Cloud" -> "AC". */
export const productInitials = (name) =>
  normalize(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')

/**
 * Resolve one inbox name to a product, or null when there is no name to go on.
 * `icon` is null for unknown products, which render as a monogram.
 */
export const productFromInboxName = (inboxName) => {
  const name = normalize(inboxName)
  if (!name) return null

  const known = PRODUCTS.find((product) => leadsWith(name, product.name))
  if (known) return { name: known.name, icon: known.icon, initials: productInitials(known.name) }

  const stripped = name.replace(TRAILING_INBOX_WORD, '').trim() || name
  return { name: stripped, icon: null, initials: productInitials(stripped) }
}

/** Resolve many inbox names, deduped by product and kept in the order they first appear. */
export const productsFromInboxNames = (inboxNames) => {
  const products = new Map()
  for (const inboxName of inboxNames || []) {
    const product = productFromInboxName(inboxName)
    if (product && !products.has(product.name)) products.set(product.name, product)
  }
  return [...products.values()]
}
