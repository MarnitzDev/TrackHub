<script setup lang="ts">
import { List, Card } from '@prisma/client'
import CardContainer from '../Card/Container.vue'

interface Props {
  list: List & { cards: Card[] }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'createCard', listId: string): void
  (e: 'editCard', cardId: string, updatedData: Partial<Card>): void
  (e: 'deleteCard', cardId: string, listId: string): void
  (e: 'editList', listId: string, updatedData: Partial<List>): void
  (e: 'deleteList', listId: string): void
  (e: 'reorderCards', payload: { listId: string, cardIds: string[] }): void
  (e: 'moveCard', payload: { cardId: string, fromListId: string, toListId: string, newIndex: number }): void
}>()

const editList = () => {
  emit('editList', props.list.id, { title: props.list.title }) // You might want to open a modal or prompt for new title here
}

const deleteList = () => {
  emit('deleteList', props.list.id)
}

const handleCreateCard = () => {
  emit('createCard', props.list.id)
}

const handleEditCard = (cardId: string, updatedData: Partial<Card>) => {
  emit('editCard', cardId, updatedData)
}

const handleDeleteCard = (cardId: string) => {
  emit('deleteCard', cardId, props.list.id)
}

const handleReorderCards = (payload: { listId: string, cardIds: string[] }) => {
  emit('reorderCards', payload)
}

const handleMoveCard = (payload: { cardId: string, fromListId: string, toListId: string, newIndex: number }) => {
  emit('moveCard', payload)
}
</script>

<template>
  <div class="bg-gray-100 p-4 rounded min-w-[250px]">
    <div class="flex justify-between items-center mb-2">
      <h2 class="text-xl font-semibold">{{ list.title }}</h2>
      <div class="flex space-x-2">
        <button @click="editList" class="text-blue-500 hover:text-blue-700">
          <UIcon name="i-lucide-edit" class="w-4 h-4" />
        </button>
        <button @click="deleteList" class="text-red-500 hover:text-red-700">
          <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
        </button>
        <span class="list-handle cursor-move">☰</span>
      </div>
    </div>
    <CardContainer
        :cards="list.cards"
        :listId="list.id"
        @editCard="handleEditCard"
        @deleteCard="handleDeleteCard"
        @reorderCards="handleReorderCards"
        @moveCard="handleMoveCard"
    />
    <button @click="handleCreateCard" class="w-full text-left p-2 text-gray-600 hover:bg-gray-200 rounded mt-2">
      + Add a card
    </button>
  </div>
</template>