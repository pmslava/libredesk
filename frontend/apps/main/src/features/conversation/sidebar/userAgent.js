/**
 * The conversation meta `user_agent` is either a product app identifying itself as
 * "<Product>/<version> (<platform>)" - e.g. "Drifttt/1.0.0 (android)" - or a plain browser
 * UA string. Product apps get a readable label, browser strings are shown as-is (the caller
 * truncates them and keeps the full text in a tooltip), and machine agents show nothing.
 */

// One name/version token plus a single parenthesised platform, and nothing else.
const PRODUCT_UA = /^([A-Za-z][A-Za-z0-9 ._-]*?)\/(\d[A-Za-z0-9.+-]*)\s*\(([A-Za-z][A-Za-z0-9 ._-]*)\)$/

// Browser UAs start with an engine token that would otherwise pass as a product name.
const ENGINE_NAMES = ['mozilla', 'opera', 'applewebkit', 'webkit', 'gecko', 'safari', 'chrome']

const MOBILE_PLATFORMS = ['android', 'ios', 'ipados', 'iphone', 'ipad', 'mobile', 'harmonyos']

// Requests made by our own tooling, not by a person.
const MACHINE_UA = /^(node|curl|axios|go-http-client|python-requests)(\/|$)/i

/**
 * @returns {{kind: 'product'|'browser', label: string, platform: string, isMobile: boolean}|null}
 *          null when there is nothing worth showing.
 */
export const formatUserAgent = (userAgent) => {
  const ua = String(userAgent ?? '').trim()
  if (!ua || MACHINE_UA.test(ua)) return null

  const match = ua.match(PRODUCT_UA)
  if (match) {
    const [, product, version, platform] = match
    const name = product.trim()
    if (!ENGINE_NAMES.includes(name.toLowerCase())) {
      return {
        kind: 'product',
        label: `${name} ${version} · ${platform}`,
        platform,
        isMobile: MOBILE_PLATFORMS.includes(platform.toLowerCase())
      }
    }
  }

  return {
    kind: 'browser',
    label: ua,
    platform: '',
    isMobile: /android|iphone|ipad|mobile/i.test(ua)
  }
}
