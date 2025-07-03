
<script setup lang="ts">
import { ref } from 'vue'
import { List, Card } from '@prisma/client'
import CardContainer from '../Card/Container.vue'
import { useListStore } from '~/stores/listStore'
import { useCardStore } from '~/stores/cardStore'

// Props
interface Props {
  list: List & { cards: Card[] }
  boardId: string
}

const props = defineProps<Props>()

// Stores
const listStore = useListStore()
const cardStore = useCardStore()

// State
const isEditModalOpen = ref(false)
const editedTitle = ref(props.list.title)
const showDeleteConfirm = ref(false)
const isDeleting = ref(false)
const isAddingCard = ref(false)
const newCardTitle = ref('')

//=============================================================================
// List Management
//=============================================================================

const openEditModal = () => {
  editedTitle.value = props.list.title
  isEditModalOpen.value = true
}

const saveListTitle = async () => {
  if (editedTitle.value.trim() !== '') {
    try {
      await listStore.editList(props.boardId, props.list.id, { title: editedTitle.value.trim() })
      isEditModalOpen.value = false
    } catch (error) {
      console.error('Error updating list title:', error)
      // Handle error (e.g., show an error message)
    }
  }
}

const confirmDelete = async () => {
  if (!props.boardId || !props.list.id) {
    console.error('Missing boardId or listId')
    return
  }
  isDeleting.value = true
  try {
    await listStore.deleteList(props.boardId, props.list.id)
    showDeleteConfirm.value = false
  } catch (error) {
    console.error('Error deleting list:', error)
  } finally {
    isDeleting.value = false
  }
}

//=============================================================================
// Card Management
//=============================================================================

const showAddCardInput = () => {
  isAddingCard.value = true
  newCardTitle.value = ''
}

const handleCreateCard = async () => {
  if (newCardTitle.value.trim() === '') return

  try {
    await cardStore.createCard({ title: newCardTitle.value.trim(), listId: props.list.id })
    newCardTitle.value = ''
    isAddingCard.value = false
    // Optionally handle successful card creation (e.g., show a success message)
  } catch (error) {
    console.error('Error creating card:', error)
    // Handle error (e.g., show an error message)
  }
}

const cancelAddCard = () => {
  isAddingCard.value = false
  newCardTitle.value = ''
}

const handleEditCard = async (cardId: string, updatedData: Partial<Card>) => {
  try {
    await cardStore.editCard(cardId, updatedData)
    // Optionally handle successful card update (e.g., show a success message)
  } catch (error) {
    console.error('Error updating card:', error)
    // Handle error (e.g., show an error message)
  }
}

const handleDeleteCard = async (cardId: string) => {
  try {
    await cardStore.deleteCard(cardId)
    // Optionally handle successful card deletion (e.g., show a success message)
  } catch (error) {
    console.error('Error deleting card:', error)
    // Handle error (e.g., show an error message)
  }
}

const handleReorderCards = async (payload: { listId: string, cardIds: string[] }) => {
  try {
    await cardStore.reorderCards(payload.listId, payload.cardIds)
    // Optionally handle successful reordering (e.g., show a success message)
  } catch (error) {
    console.error('Error reordering cards:', error)
    // Handle error (e.g., show an error message)
  }
}

const handleMoveCard = async (payload: { cardId: string, fromListId: string, toListId: string, newIndex: number }) => {
  try {
    await cardStore.moveCard(payload)
    // Optionally handle successful card move (e.g., show a success message)
  } catch (error) {
    console.error('Error moving card:', error)
    // Handle error (e.g., show an error message)
  }
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
        <button @click="showDeleteConfirm = true" class="text-red-500 hover:text-red-700">
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

    <div v-if="isAddingCard" class="mt-2">
      <textarea
          v-model="newCardTitle"
          class="w-full p-2 border rounded resize-none"
          placeholder="Enter a title for this card..."
          rows="3"
          @keydown.enter.prevent="handleCreateCard"
      ></textarea>
      <div class="flex justify-between mt-2">
        <UButton
            color="primary"
            size="sm"
            @click="handleCreateCard"
        >
          Add Card
        </UButton>
        <UButton
            color="gray"
            size="sm"
            @click="cancelAddCard"
        >
          Cancel
        </UButton>
      </div>
    </div>
    <button
        v-else
        @click="showAddCardInput"
        class="w-full text-left p-2 text-gray-600 hover:bg-gray-200 rounded mt-2"
    >
      + Add a card
    </button>

    <!-- Edit List Modal -->
    <UModal :open="isEditModalOpen">
      <template #content>
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

    <!-- Delete Confirmation Modal -->
    <UModal :open="showDeleteConfirm">
      <template #content>
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">Confirm Delete</h3>
          <p>Are you sure you want to delete this list?</p>
          <div class="mt-4 flex justify-end gap-2">
            <UButton @click="showDeleteConfirm = false">Cancel</UButton>
            <UButton color="red" :loading="isDeleting" @click="confirmDelete">Delete</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>