/**
 * Slash commands for private notes.
 *
 * This desk hands work to an AI runner by writing a private note addressed to
 * it, and the address has a fixed shape: "@claude opus xhigh: " - a runner, a
 * model, an effort. Typing that by hand is where the typos are, so a "/" at the
 * start of a note line opens a menu that walks runner -> model -> effort and
 * writes the whole prefix in one go.
 *
 * Everything here is pure: the runner catalogue plus the functions that turn it
 * into menu levels and into the text that gets inserted. The TipTap wiring lives
 * in noteCommandSuggestion.js and the menu itself in NoteCommandList.vue.
 *
 * The catalogue is the only place to edit when a runner, a model or an effort
 * level changes.
 */

export const NOTE_RUNNERS = [
  {
    id: 'claude',
    label: 'Claude',
    mention: '@claude',
    models: ['fable', 'opus', 'sonnet', 'haiku'],
    efforts: ['low', 'medium', 'high', 'xhigh', 'max']
  },
  {
    id: 'codex',
    label: 'Codex',
    mention: '@codex',
    models: ['gpt-5.6-terra', 'gpt-5.6-sol', 'gpt-5.6-luna', 'gpt-5.5', 'gpt-6-astra'],
    efforts: ['low', 'medium', 'high', 'xhigh']
  }
]

/** The character that opens the menu. */
export const NOTE_COMMAND_CHAR = '/'

const runnerAlternatives = NOTE_RUNNERS.map((runner) => runner.id).join('|')

/**
 * A "/" only opens the menu at the start of a note line, or directly after a
 * runner mention on that line, which is where "/model" and "/effort" are useful.
 * `textBeforeChar` is the line's text up to the "/".
 */
const COMMAND_POSITION_PATTERN = new RegExp(`^\\s*(?:@(${runnerAlternatives})\\b)?\\s*$`, 'i')

/** The note addresses a runner when its first token is that runner's mention. */
const LEADING_MENTION_PATTERN = new RegExp(`^\\s*@(${runnerAlternatives})\\b`, 'i')

export const findRunner = (runnerId) =>
  NOTE_RUNNERS.find((runner) => runner.id === String(runnerId ?? '').toLowerCase()) ?? null

/**
 * Returns `{ runner }` when a "/" typed after `textBeforeChar` should open the
 * menu, and null when it should not. `runner` is the runner named on that line,
 * or null at the start of an empty line.
 */
export function noteCommandPosition(textBeforeChar = '') {
  const match = COMMAND_POSITION_PATTERN.exec(textBeforeChar)
  if (!match) return null
  return { runner: match[1] ? match[1].toLowerCase() : null }
}

/** The runner a note is already addressed to, from the note's leading mention. */
export function detectNoteRunner(noteText = '') {
  const match = LEADING_MENTION_PATTERN.exec(noteText)
  return match ? match[1].toLowerCase() : null
}

/**
 * Strips the open command - the "/" and the query the caret sits in - off the
 * end of the current line, leaving the text that preceded the "/".
 */
export function textBeforeCommandChar(lineBeforeCaret = '', query = '') {
  const length = lineBeforeCaret.length - query.length - NOTE_COMMAND_CHAR.length
  return length > 0 ? lineBeforeCaret.slice(0, length) : ''
}

/** The text a finished runner + model + effort choice writes into the note. */
/** An empty model means "the runner's current default", so the prefix names no model at all. */
export const runnerPrefix = (runner, model, effort) =>
  model ? `${runner.mention} ${model} ${effort}: ` : `${runner.mention} ${effort}: `

/** The model-level entry that leaves the model to the runner's current default. */
export const DEFAULT_MODEL_LABEL = 'Default (current)'

const effortLeaves = (runner, model) =>
  runner.efforts.map((effort) => ({
    id: `${runner.id}:${model || 'default'}:${effort}`,
    label: effort,
    hint: runnerPrefix(runner, model, effort).trim(),
    text: runnerPrefix(runner, model, effort)
  }))

const runnerEntry = (runner) => ({
  id: runner.id,
  label: runner.label,
  hint: runner.mention,
  children: [
    { id: `${runner.id}:default`, label: DEFAULT_MODEL_LABEL, children: effortLeaves(runner, '') },
    ...runner.models.map((model) => ({
      id: `${runner.id}:${model}`,
      label: model,
      children: effortLeaves(runner, model)
    }))
  ]
})

// "/model" and "/effort" complete a note that already names its runner, so they
// write only the missing token and keep the same trailing spacing.
const modelEntry = (runner) => ({
  id: 'model',
  label: 'model',
  hintKey: 'noteCommand.modelFor',
  hintParams: { runner: runner.mention },
  children: runner.models.map((model) => ({
    id: `model:${model}`,
    label: model,
    text: `${model} `
  }))
})

const effortEntry = (runner) => ({
  id: 'effort',
  label: 'effort',
  hintKey: 'noteCommand.effortFor',
  hintParams: { runner: runner.mention },
  children: runner.efforts.map((effort) => ({
    id: `effort:${effort}`,
    label: effort,
    text: `${effort}: `
  }))
})

/**
 * The first menu level: every runner, plus the "model" and "effort" shortcuts
 * when the note already names a runner to complete.
 */
export function buildNoteCommandMenu(runnerId) {
  const items = NOTE_RUNNERS.map(runnerEntry)
  const runner = findRunner(runnerId)
  if (runner) items.push(modelEntry(runner), effortEntry(runner))
  return items
}

/** Case-insensitive substring filter over a menu level. */
export function filterNoteCommandItems(items = [], query = '') {
  const needle = query.trim().toLowerCase()
  if (!needle) return items
  return items.filter((item) => item.label.toLowerCase().includes(needle))
}
