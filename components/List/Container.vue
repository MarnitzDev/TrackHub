<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import draggable from 'vuedraggable'
import { Board, List, Card } from '@prisma/client'
import ListItem from './Item.vue'

interface ListWithCards extends List {
  cards: Card[]
}

interface Props {
  board?: Board & { lists: ListWithCards[] }
}

const props = defineProps<Props>()
const emit = defineEmits([
  'reorderLists',
  'createCard',
  'editCard',
  'deleteCard',
  'editList',
  'deleteList',
  'reorderCards',
  'moveCard'
])

const lists = ref<ListWithCards[]>([])

// Use a computed property to safely access board.lists
const boardLists = computed(() => props.board?.lists || [])

// Update the watch to use the computed property
watch(boardLists, (newLists) => {
  lists.value = newLists
}, { immediate: true, deep: true })

const handleListChange = (event: any) => {
  if (event.moved) {
    emit('reorderLists', lists.value.map(list => list.id))
  }
}

const handleCreateCard = (listId: string) => {
  emit('createCard', listId)
}

const handleEditCard = (card: Card) => {
  emit('editCard', card)
}

const handleDeleteCard = (cardId: string) => {
  emit('deleteCard', cardId)
}

const handleEditList = (list: List) => {
  emit('editList', list)
}

const handleDeleteList = (listId: string) => {
  emit('deleteList', listId)
}

const handleReorderCards = (payload: { listId: string, cardIds: string[] }) => {
  emit('reorderCards', payload)
}

const handleMoveCard = (payload: { cardId: string, fromListId: string, toListId: string, newIndex: number }) => {
  console.log('handleMoveCard called with payload:', payload);
  emit('moveCard', payload)
}

// Update the watch to use the computed property
watch(boardLists, (newLists) => {
  console.log('New lists:', newLists)
  lists.value = newLists
}, { immediate: true, deep: true })
</script>

<template>
  <div>
    <p>Number of lists: {{ lists.length }}</p>
    <draggable
        v-model="lists"
        item-key="id"
        class="flex space-x-4 overflow-x-auto"
        handle=".list-handle"
        @change="handleListChange"
    >
      <template #item="{ element: list }">
        <ListItem
            :list="list"
            @createCard="handleCreateCard"
            @editCard="handleEditCard"
            @deleteCard="handleDeleteCard"
            @editList="handleEditList"
            @deleteList="handleDeleteList"
            @reorderCards="handleReorderCards"
            @moveCard="handleMoveCard"
        />
      </template>
  </draggable>
  </div>
</template>