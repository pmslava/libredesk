<template>
  <div class="note-command-list bg-background border rounded-lg shadow-lg overflow-hidden">
    <div
      class="flex items-center gap-2 border-b px-3 py-1.5 text-xs text-muted-foreground"
      :class="{ 'font-medium': !trail.length }"
    >
      <span class="truncate">{{ trail.length ? trail.join(' › ') : $t('noteCommand.title') }}</span>
      <span v-if="trail.length" class="ml-auto shrink-0">← {{ $t('noteCommand.back') }}</span>
    </div>

    <div v-if="visibleItems.length > 0" class="max-h-60 overflow-y-auto">
      <button
        v-for="(item, index) in visibleItems"
        :key="item.id"
        class="note-command-item w-full text-left px-3 py-2 hover:bg-muted"
        :class="{ 'bg-muted': index === selectedIndex }"
        @click="selectItem(index)"
      >
        <div class="flex items-center gap-2">
          <span class="font-medium">{{ item.label }}</span>
          <span v-if="item.hint || item.hintKey" class="truncate text-xs text-muted-foreground">
            {{ item.hintKey ? $t(item.hintKey, item.hintParams || {}) : item.hint }}
          </span>
          <ChevronRight
            v-if="item.children"
            class="ml-auto size-3.5 shrink-0 text-muted-foreground"
          />
        </div>
      </button>
    </div>
    <div v-else class="p-3">
      <span class="text-sm text-muted-foreground">{{ $t('globals.messages.noResultsFound') }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import { filterNoteCommandItems } from './noteCommands'

const props = defineProps({
  items: { type: Array, default: () => [] },
  command: { type: Function, required: true },
  query: { type: String, default: '' }
})

// One frame per menu level entered, remembering how much of the query already
// belonged to the levels above it, so typing filters only the level on screen.
const stack = ref([])
const selectedIndex = ref(0)

const currentFrame = computed(() => stack.value[stack.value.length - 1] ?? null)
const level = computed(() => currentFrame.value?.entry.children ?? props.items)
const levelQuery = computed(() => props.query.slice(currentFrame.value?.offset ?? 0))
const visibleItems = computed(() => filterNoteCommandItems(level.value, levelQuery.value))
const trail = computed(() => stack.value.map((frame) => frame.entry.label))

const selectItem = (index) => {
  const item = visibleItems.value[index]
  if (!item) return
  if (item.children?.length) {
    stack.value = [...stack.value, { entry: item, offset: props.query.length }]
    selectedIndex.value = 0
    return
  }
  if (item.text) props.command(item)
}

const goBack = () => {
  if (!stack.value.length) return false
  stack.value = stack.value.slice(0, -1)
  selectedIndex.value = 0
  return true
}

// Backspacing past the point a level was entered walks back out of it.
watch(
  () => props.query,
  (query) => {
    while (stack.value.length && query.length < stack.value[stack.value.length - 1].offset) {
      stack.value = stack.value.slice(0, -1)
    }
    selectedIndex.value = 0
  }
)

watch(visibleItems, (items) => {
  if (selectedIndex.value >= items.length) selectedIndex.value = 0
})

watch(selectedIndex, () =>
  nextTick(() =>
    document.querySelector('.note-command-item.bg-muted')?.scrollIntoView({ block: 'nearest' })
  )
)

defineExpose({
  onKeyDown: ({ event }) => {
    if (event.key === 'ArrowLeft') return goBack()
    if (!visibleItems.value.length) return false
    const selected = visibleItems.value[selectedIndex.value]
    if (event.key === 'ArrowUp')
      selectedIndex.value =
        (selectedIndex.value + visibleItems.value.length - 1) % visibleItems.value.length
    else if (event.key === 'ArrowDown')
      selectedIndex.value = (selectedIndex.value + 1) % visibleItems.value.length
    else if (event.key === 'Enter' || event.key === 'Tab') selectItem(selectedIndex.value)
    // Right only drills in; on a leaf it stays a caret move.
    else if (event.key === 'ArrowRight' && selected?.children?.length)
      selectItem(selectedIndex.value)
    else return false
    return true
  }
})
</script>

<style scoped>
.note-command-list {
  min-width: 240px;
  max-width: 360px;
}
</style>
