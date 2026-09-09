import { VueRenderer } from '@tiptap/vue-3'

export function createSuggestionRenderer(ListComponent) {
  let component
  let popup
  let dismissed = false
  let lastClientRect = null
  let resizeObserver = null

  return {
    onStart: (props) => {
      dismissed = false
      component = new VueRenderer(ListComponent, {
        props: { ...props, query: props.query },
        editor: props.editor
      })
      if (!props.clientRect) return

      popup = document.createElement('div')
      popup.style.position = 'fixed'
      popup.style.zIndex = '9999'
      if (component.element) popup.appendChild(component.element)
      document.body.appendChild(popup)
      lastClientRect = props.clientRect
      updatePosition(popup, lastClientRect)
      // The list renders (and, for multi-level menus, grows or shrinks) after the first positioning pass, so
      // a single measurement can miss the real height and leave the popup clipped below the viewport.
      // Re-run the placement whenever the popup's size changes; the anchor rect stays the caret's.
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          if (popup && lastClientRect) updatePosition(popup, lastClientRect)
        })
        resizeObserver.observe(popup)
      }
    },

    onUpdate: (props) => {
      component.updateProps({ ...props, query: props.query })
      if (!props.clientRect || !popup) return
      lastClientRect = props.clientRect
      updatePosition(popup, lastClientRect)
    },

    onKeyDown: (props) => {
      if (dismissed) return false
      if (props.event.key === 'Escape') {
        dismissed = true
        if (popup) popup.style.display = 'none'
        return true
      }
      return component.ref?.onKeyDown(props)
    },

    onExit: () => {
      resizeObserver?.disconnect()
      resizeObserver = null
      popup?.remove()
      component.destroy()
    }
  }
}

function updatePosition(popup, clientRect) {
  const rect = clientRect()
  if (!rect) return

  popup.style.left = `${rect.left}px`
  popup.style.top = `${rect.bottom + 4}px`

  requestAnimationFrame(() => {
    const popupRect = popup.getBoundingClientRect()
    if (popupRect.right > window.innerWidth) {
      popup.style.left = `${window.innerWidth - popupRect.width - 8}px`
    }
    if (popupRect.bottom > window.innerHeight) {
      popup.style.top = `${rect.top - popupRect.height - 4}px`
    }
  })
}
