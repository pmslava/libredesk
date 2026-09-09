// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { Editor } from '@tiptap/vue-3'
import { buildConversationExtensions } from './editorExtensions'
import noteCommandSuggestion from './noteCommandSuggestion'

let editor

// The flag only gates `allow`, so the tests that call `items` and `command`
// directly leave it off: an active suggestion would mount the popup component,
// and outside the app it has no i18n context to render with.
const createEditor = (content, noteCommandsEnabled = false) => {
  editor = new Editor({
    extensions: buildConversationExtensions({ getPlaceholder: () => '' }),
    content,
    editorProps: { noteCommandsEnabled: () => noteCommandsEnabled }
  })
  return editor
}

/** Document position of the first "/" in a single paragraph of plain text. */
const slashPosition = (text) => text.indexOf('/') + 1

const allowAt = (text, noteCommandsEnabled = true) => {
  const instance = createEditor(`<p>${text}</p>`, noteCommandsEnabled)
  const from = slashPosition(text)
  return noteCommandSuggestion.allow({
    editor: instance,
    state: instance.state,
    range: { from, to: from + 1 }
  })
}

afterEach(() => {
  editor?.destroy()
  editor = null
})

describe('note command suggestion', () => {
  describe('where it opens', () => {
    it('opens at the start of a line', () => {
      expect(allowAt('/')).toBe(true)
    })

    it('opens right after a runner mention on the same line', () => {
      expect(allowAt('@claude /')).toBe(true)
    })

    it('stays closed mid-line', () => {
      expect(allowAt('ask them /')).toBe(false)
    })

    it('stays closed when the composer is not in private note mode', () => {
      expect(allowAt('/', false)).toBe(false)
    })
  })

  describe('menu contents', () => {
    it('offers only the runners on a fresh note', () => {
      const instance = createEditor('<p>/</p>')
      instance.commands.setTextSelection(2)
      expect(noteCommandSuggestion.items({ editor: instance, query: '' }).map((i) => i.label)).toEqual(
        ['Claude', 'Codex']
      )
    })

    it('offers the shortcuts when the line already names a runner', () => {
      const instance = createEditor('<p>@claude /mo</p>')
      instance.commands.setTextSelection(instance.state.doc.content.size - 1)
      expect(
        noteCommandSuggestion.items({ editor: instance, query: 'mo' }).map((i) => i.label)
      ).toEqual(['Claude', 'Codex', 'model', 'effort'])
    })
  })

  describe('insertion', () => {
    it('replaces the typed command with the prefix, trailing space and all', () => {
      const instance = createEditor('<p>/claude</p>')
      noteCommandSuggestion.command({
        editor: instance,
        range: { from: 1, to: 8 },
        props: { text: '@claude opus xhigh: ' }
      })
      expect(instance.getText()).toBe('@claude opus xhigh: ')
    })

    it('does nothing without text to insert', () => {
      const instance = createEditor('<p>/claude</p>')
      noteCommandSuggestion.command({ editor: instance, range: { from: 1, to: 8 }, props: {} })
      expect(instance.getText()).toBe('/claude')
    })
  })
})
