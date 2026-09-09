import { Extension } from '@tiptap/vue-3'
import { PluginKey } from '@tiptap/pm/state'
import Suggestion from '@tiptap/suggestion'
import { NOTE_COMMAND_CHAR } from './noteCommands'

/**
 * Slash commands for private notes. Unlike the mention and conversation
 * reference suggestions this inserts plain text rather than a node, so it is a
 * bare Suggestion plugin instead of an extended Mention. The plugin key is
 * created per editor so it never collides with the other two suggestions.
 */
export const NoteCommand = Extension.create({
  name: 'noteCommand',

  addOptions() {
    return { suggestion: { char: NOTE_COMMAND_CHAR } }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        pluginKey: new PluginKey('noteCommand'),
        editor: this.editor,
        ...this.options.suggestion
      })
    ]
  }
})
