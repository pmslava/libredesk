import { describe, it, expect } from "vitest"
import { contactLanguages } from "./languages"

describe("contactLanguages", () => {
  it("reads the language attribute", () => {
    expect(contactLanguages({ language: "English", plan: "pro" })).toEqual(["English"])
  })
  it("accepts per-product language keys and deduplicates case-insensitively", () => {
    expect(contactLanguages({ language: "English", language_studio: "Deutsch", studio_language: "english" })).toEqual([
      "English",
      "Deutsch"
    ])
  })
  it("ignores blanks, non-strings and unrelated keys", () => {
    expect(contactLanguages({ language: "  ", timezone: "Europe/Belgrade", sessions: 3 })).toEqual([])
    expect(contactLanguages(null)).toEqual([])
  })
})
