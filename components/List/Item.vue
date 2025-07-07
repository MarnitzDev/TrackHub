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
    const updatedCard = await cardStore.editCard(cardId, updatedData)
    // Update the card in the listStore
    listStore.updateCard(props.list.id, updatedCard)
    // Optionally handle successful card update (e.g., show a success message)
  } catch (error) {
    console.error('Error updating card:', error)
    // Handle error (e.g., show an error message)
  }
}

const handleDeleteCard = async (cardId: string) => {
  try {
    await cardStore.deleteCard(cardId)
    // Remove the card from the listStore
    listStore.removeCardFromList(props.list.id, cardId)
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
  <div class="list-wrapper">
    <div class="list-content">
      <div class="list-header">
        <h2 class="list-title">{{ list.title }}</h2>
        <div class="list-actions">
          <UButton @click="openEditModal" color="neutral" variant="link" class="edit-btn">
            <UIcon name="i-lucide-edit" class="w-4 h-4" />
          </UButton>
          <UButton @click="showDeleteConfirm = true" color="neutral" variant="link" class="delete-btn">
            <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
          </UButton>
          <UIcon name="i-lucide-grip-vertical" class="list-handle" />
        </div>
      </div>

      <div class="cards-container">
        <CardContainer
            :cards="list.cards"
            :listId="list.id"
            @editCard="handleEditCard"
            @deleteCard="handleDeleteCard"
            @reorderCards="handleReorderCards"
            @moveCard="handleMoveCard"
        />
      </div>

      <div class="add-card-section">
        <div v-if="isAddingCard" class="add-card-form">
          <textarea
              v-model="newCardTitle"
              class="new-card-input"
              placeholder="Enter a title for this card..."
              rows="3"
              @keydown.enter.prevent="handleCreateCard"
          ></textarea>
          <div class="add-card-actions">
            <UButton
                color="primary"
                size="sm"
                @click="handleCreateCard"
            >
              Add Card
            </UButton>
            <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                @click="cancelAddCard"
            >
              Cancel
            </UButton>
          </div>
        </div>
        <UButton
            v-else
            @click="showAddCardInput"
            color="neutral"
            variant="ghost"
            class="add-card-btn"
        >
          + Add a card
        </UButton>
      </div>
    </div>
    <!-- Edit List Modal -->
    <UModal :open="isEditModalOpen">
      <template #content>
        <div class="modal-content">
          <h3 class="modal-title">Edit List Title</h3>
          <UInput
              v-model="editedTitle"
              placeholder="Enter list title"
              class="edit-title-input"
          />
          <div class="modal-actions">
            <UButton @click="isEditModalOpen = false" color="neutral" variant="ghost">
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
        <div class="modal-content">
          <h3 class="modal-title">Confirm Delete</h3>
          <p>Are you sure you want to delete this list?</p>
          <div class="modal-actions">
            <UButton @click="showDeleteConfirm = false" color="neutral" variant="ghost">Cancel</UButton>
            <UButton :loading="isDeleting" @click="confirmDelete" color="error" variant="soft">Delete</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.list-wrapper {
  width: 272px;
  margin-right: 8px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 275px);
  min-height: 100px;
}

.list-content {
  background-color: #ebecf0;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
}

.list-header {
  flex-shrink: 0;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ebecf0;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}

.list-title {
  font-weight: bold;
  font-size: 14px;
  margin: 0;
}

.list-actions {
  display: flex;
  align-items: center;
}

.edit-btn, .delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  margin-left: 4px;
}

.list-handle {
  cursor: move;
  padding: 4px;
  margin-left: 4px;
}

.cards-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 8px;
}

.add-card-section {
  flex-shrink: 0;
  padding: 8px;
  background-color: #ebecf0;
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
}

.add-card-form {
  margin-bottom: 8px;
}

.new-card-input {
  width: 100%;
  padding: 6px 8px;
  border: none;
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(9,30,66,.25);
  margin-bottom: 8px;
  resize: none;
}

.add-card-actions {
  display: flex;
  justify-content: space-between;
}

.add-card-btn {
  width: 100%;
  text-align: left;
  padding: 8px;
  background-color: transparent;
  border: none;
  border-radius: 3px;
  color: #5e6c84;
  cursor: pointer;
}

.add-card-btn:hover {
  background-color: rgba(9,30,66,.08);
  color: #172b4d;
}

.modal-content {
  padding: 16px;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
}

.edit-title-input {
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Customizing the scrollbar for cards */
.cards-container::-webkit-scrollbar {
  width: 8px;
}

.cards-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.cards-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.cards-container::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>