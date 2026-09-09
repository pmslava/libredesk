/**
 * The languages a contact uses in the products that report them as contact
 * attributes. Drifttt writes `language`; another product may write
 * `language_<product>` or `<product>_language`. Values are shown next to the
 * country, deduplicated, in the order the attributes come in.
 */
const LANGUAGE_KEY = /^(language|language_[a-z0-9_]+|[a-z0-9_]+_language)$/i

export function contactLanguages(customAttributes) {
  if (!customAttributes || typeof customAttributes !== "object") return []
  const seen = new Set()
  const out = []
  for (const [key, value] of Object.entries(customAttributes)) {
    if (!LANGUAGE_KEY.test(key) || typeof value !== "string") continue
    const label = value.trim()
    if (!label || seen.has(label.toLowerCase())) continue
    seen.add(label.toLowerCase())
    out.push(label)
  }
  return out
}
