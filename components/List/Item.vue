<script setup lang="ts">
import { ref } from 'vue'
import { List, Card } from '@prisma/client'
import CardContainer from '../Card/Container.vue'

// Props and Emits
// -----------------------------
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

// State
// -----------------------------
const isEditModalOpen = ref(false)
const editedTitle = ref(props.list.title)

//=============================================================================
// List Management
//=============================================================================

const openEditModal = () => {
  editedTitle.value = props.list.title
  isEditModalOpen.value = true
}

const saveListTitle = () => {
  if (editedTitle.value.trim() !== '') {
    emit('editList', props.list.id, { title: editedTitle.value.trim() })
    isEditModalOpen.value = false
  }
}

const deleteList = () => {
  emit('deleteList', props.list.id)
}

//=============================================================================
// Card Management
//=============================================================================

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
        <button @click="openEditModal" class="text-blue-500 hover:text-blue-700">
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

    <!-- Edit List Modal -->
    <UModal :open="isEditModalOpen">
      <template #body>
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-4">Edit List Title</h3>
          <UInput
              v-model="editedTitle"
              placeholder="Enter list title"
              class="mb-4"
          />
          <div class="flex justify-end space-x-2">
            <UButton @click="isEditModalOpen = false">
              Cancel
            </UButton>
            <UButton
                color="primary"
                @click="saveListTitle"
            >
              Save
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>