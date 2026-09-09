import NoteCommandList from './NoteCommandList.vue'
import { createSuggestionRenderer } from './suggestionRenderer'
import {
  NOTE_COMMAND_CHAR,
  buildNoteCommandMenu,
  detectNoteRunner,
  noteCommandPosition,
  textBeforeCommandChar
} from './noteCommands'

/** The current text block's text from its start up to `pos`. */
const lineBefore = (state, pos) => {
  const $pos = state.doc.resolve(pos)
  return state.doc.textBetween($pos.start(), pos, '\n', ' ')
}

export default {
  char: NOTE_COMMAND_CHAR,
  allowSpaces: false,
  allow: ({ editor, state, range }) => {
    if (!(editor.options.editorProps?.noteCommandsEnabled?.() ?? false)) return false
    return noteCommandPosition(lineBefore(state, range.from)) !== null
  },
  // The runner named on this line wins over the one the note opens with, so
  // "@codex /model" offers Codex's models even in a note addressed to Claude.
  items: ({ editor, query }) => {
    const { state } = editor
    const beforeChar = textBeforeCommandChar(lineBefore(state, state.selection.from), query)
    const runner = noteCommandPosition(beforeChar)?.runner ?? detectNoteRunner(editor.getText())
    return buildNoteCommandMenu(runner)
  },
  // Inserted as a text node rather than parsed content so the trailing space
  // that separates the prefix from the instruction survives.
  command: ({ editor, range, props }) => {
    if (!props?.text) return
    editor
      .chain()
      .focus()
      .insertContentAt(range, [{ type: 'text', text: props.text }])
      .run()
  },
  render: () => createSuggestionRenderer(NoteCommandList)
}
