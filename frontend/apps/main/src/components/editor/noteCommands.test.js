import { describe, expect, it } from 'vitest'
import {
  NOTE_RUNNERS,
  buildNoteCommandMenu,
  detectNoteRunner,
  filterNoteCommandItems,
  findRunner,
  noteCommandPosition,
  runnerPrefix,
  textBeforeCommandChar
} from './noteCommands'

const labels = (items) => items.map((item) => item.label)
const child = (items, label) => items.find((item) => item.label === label)

describe('note slash commands', () => {
  describe('command position', () => {
    it('opens at the start of an empty line', () => {
      expect(noteCommandPosition('')).toEqual({ runner: null })
      expect(noteCommandPosition('   ')).toEqual({ runner: null })
    })

    it('opens directly after a runner mention on the same line', () => {
      expect(noteCommandPosition('@claude ')).toEqual({ runner: 'claude' })
      expect(noteCommandPosition('@Codex ')).toEqual({ runner: 'codex' })
    })

    it('stays closed in the middle of a line', () => {
      expect(noteCommandPosition('see the ')).toBeNull()
      expect(noteCommandPosition('@claude opus ')).toBeNull()
      expect(noteCommandPosition('@anna ')).toBeNull()
    })
  })

  describe('runner detection', () => {
    it('reads the runner off the note opening mention', () => {
      expect(detectNoteRunner('@claude look at this')).toBe('claude')
      expect(detectNoteRunner('  @Codex\nplease review')).toBe('codex')
    })

    it('returns null when the note opens with anything else', () => {
      expect(detectNoteRunner('')).toBeNull()
      expect(detectNoteRunner('please review, @claude')).toBeNull()
      expect(detectNoteRunner('@anna please review')).toBeNull()
    })

    it('finds a runner by id, case-insensitively', () => {
      expect(findRunner('CLAUDE')?.mention).toBe('@claude')
      expect(findRunner('nobody')).toBeNull()
      expect(findRunner(null)).toBeNull()
    })
  })

  describe('menu', () => {
    it('offers every runner at the first level', () => {
      expect(labels(buildNoteCommandMenu(null))).toEqual(['Claude', 'Codex'])
    })

    it('adds the model and effort shortcuts once a runner is known', () => {
      expect(labels(buildNoteCommandMenu('codex'))).toEqual(['Claude', 'Codex', 'model', 'effort'])
    })

    it('walks runner, model and effort down to the inserted prefix', () => {
      const claude = child(buildNoteCommandMenu(null), 'Claude')
      expect(labels(claude.children)).toEqual(['opus', 'sonnet', 'haiku'])

      const opus = child(claude.children, 'opus')
      expect(labels(opus.children)).toEqual(['low', 'medium', 'high', 'xhigh', 'max'])

      expect(child(opus.children, 'xhigh').text).toBe('@claude opus xhigh: ')
    })

    it('carries the codex model catalogue', () => {
      const codex = child(buildNoteCommandMenu(null), 'Codex')
      expect(labels(codex.children)).toEqual([
        'gpt-5.6-terra',
        'gpt-5.6-sol',
        'gpt-5.6-luna',
        'gpt-5.5',
        'gpt-6-astra'
      ])
      const terra = child(codex.children, 'gpt-5.6-terra')
      expect(labels(terra.children)).toEqual(['low', 'medium', 'high', 'xhigh'])
      expect(child(terra.children, 'high').text).toBe('@codex gpt-5.6-terra high: ')
    })

    it('completes a note that already names its runner with just the missing token', () => {
      const menu = buildNoteCommandMenu('claude')
      expect(child(child(menu, 'model').children, 'sonnet').text).toBe('sonnet ')
      expect(child(child(menu, 'effort').children, 'max').text).toBe('max: ')
    })

    it('names the runner the shortcuts complete', () => {
      const menu = buildNoteCommandMenu('codex')
      expect(child(menu, 'model')).toMatchObject({
        hintKey: 'noteCommand.modelFor',
        hintParams: { runner: '@codex' }
      })
      expect(child(menu, 'effort')).toMatchObject({
        hintKey: 'noteCommand.effortFor',
        hintParams: { runner: '@codex' }
      })
    })

    it('gives every entry a unique id', () => {
      const ids = []
      const walk = (items) =>
        items.forEach((item) => {
          ids.push(item.id)
          if (item.children) walk(item.children)
        })
      walk(buildNoteCommandMenu('claude'))
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('builds the prefix from the runner mention', () => {
      expect(runnerPrefix(NOTE_RUNNERS[0], 'haiku', 'low')).toBe('@claude haiku low: ')
    })
  })

  describe('filtering', () => {
    const items = [{ label: 'opus' }, { label: 'sonnet' }, { label: 'haiku' }]

    it('returns the level untouched for an empty query', () => {
      expect(filterNoteCommandItems(items, '')).toBe(items)
      expect(filterNoteCommandItems(items, '  ')).toBe(items)
    })

    it('matches a case-insensitive substring', () => {
      expect(labels(filterNoteCommandItems(items, 'NE'))).toEqual(['sonnet'])
      expect(labels(filterNoteCommandItems(items, 'u'))).toEqual(['opus', 'haiku'])
      expect(filterNoteCommandItems(items, 'zzz')).toEqual([])
    })
  })

  describe('text before the command character', () => {
    it('strips the slash and the open query', () => {
      expect(textBeforeCommandChar('@claude /mod', 'mod')).toBe('@claude ')
      expect(textBeforeCommandChar('/', '')).toBe('')
      expect(textBeforeCommandChar('', '')).toBe('')
    })
  })
})
