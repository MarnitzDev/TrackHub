<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import draggable from 'vuedraggable'
import { Board, List, Card } from '@prisma/client'
import { useListStore } from '~/stores/listStore'
import { useCardStore } from '~/stores/cardStore'
import ListItem from './Item.vue'
import { useRoute } from 'vue-router'

interface Props {
  boardId: string
}

const props = defineProps<Props>()

const listStore = useListStore()
const cardStore = useCardStore()
const route = useRoute()
const { loading, error } = storeToRefs(listStore)

const sortedLists = computed(() => listStore.sortedLists)

onMounted(async () => {
  if (props.boardId) {
    await listStore.fetchLists(props.boardId)
  } else {
    console.error("No boardId available in props")
  }
})

const handleListChange = async (event: any) => {
  if (event.moved) {
    const newOrder = sortedLists.value.map((list, index) => ({ id: list.id, order: index }))

    // Optimistic update
    listStore.updateListOrder(newOrder)

    try {
      await listStore.reorderLists(props.boardId, newOrder)
    } catch (error) {
      console.error('Error reordering lists:', error)
      await listStore.fetchLists(props.boardId)
    }
  }
}

const handleEditList = async (listId: string, updatedData: Partial<List>) => {
  // Optimistic update
  listStore.updateList(listId, updatedData)

  try {
    await listStore.editList(props.boardId, listId, updatedData)
  } catch (error) {
    console.error('Error updating list:', error)
    await listStore.fetchLists(props.boardId)
  }
}

const handleCreateCard = async (listId: string, cardData: Partial<Card>) => {
  const tempId = `temp-${Date.now()}`
  const tempCard = { id: tempId, ...cardData, listId } as Card

  // Optimistic update
  listStore.addCardToList(listId, tempCard)

  try {
    const newCard = await cardStore.createCard({ ...cardData, listId })
    listStore.replaceCard(listId, tempId, newCard)
  } catch (error) {
    console.error('Error creating card:', error)
    listStore.removeCardFromList(listId, tempId)
  }
}

const handleEditCard = async (cardId: string, updatedData: Partial<Card>) => {
  // Optimistic update
  listStore.updateCard(cardId, updatedData)

  try {
    await cardStore.updateCard({ id: cardId, ...updatedData })
  } catch (error) {
    console.error('Error updating card:', error)
    await listStore.fetchLists(props.boardId)
  }
}

const handleDeleteCard = async (cardId: string, listId: string) => {
  // Optimistic update
  listStore.removeCardFromList(listId, cardId)

  try {
    await cardStore.deleteCard(cardId)
  } catch (error) {
    console.error('Error deleting card:', error)
    await listStore.fetchLists(props.boardId)
  }
}

const handleReorderCards = async (listId: string, cardIds: string[]) => {
  // Optimistic update
  listStore.updateCardOrder(listId, cardIds)

  try {
    await listStore.reorderCards(listId, cardIds)
  } catch (error) {
    console.error('Error reordering cards:', error)
    await listStore.fetchLists(props.boardId)
  }
}

const handleMoveCard = async (payload: { cardId: string, fromListId: string, toListId: string, newIndex: number }) => {
  // Optimistic update
  listStore.moveCard(payload)

  try {
    await cardStore.moveCard(payload)
  } catch (error) {
    console.error('Error moving card:', error)
    await listStore.fetchLists(props.boardId)
  }
}

const listToDelete = ref<string | null>(null)
const showDeleteConfirm = ref(false)

const handleDeleteListRequest = (listId: string) => {
  listToDelete.value = listId
  showDeleteConfirm.value = true
}

const handleDeleteList = async () => {
  if (!listToDelete.value || !props.boardId) return

  // Optimistic update
  const deletedList = listStore.removeList(listToDelete.value)

  try {
    await listStore.deleteList(props.boardId, listToDelete.value)
  } catch (error) {
    console.error('Error deleting list:', error)
    if (deletedList) listStore.addList(deletedList)
  } finally {
    showDeleteConfirm.value = false
    listToDelete.value = null
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  listToDelete.value = null
}
</script>

<template>
  <div>
    <p v-if="loading">Loading lists...</p>
    <p v-else-if="error">Error: {{ error }}</p>
    <template v-else>
      <draggable
          :list="sortedLists"
          item-key="id"
          class="flex space-x-4 overflow-x-auto"
          handle=".list-handle"
          @change="handleListChange"
      >
        <template #item="{ element: list }">
          <ListItem
              :list="list"
              :boardId="props.boardId"
              @createCard="(cardData) => handleCreateCard(list.id, cardData)"
              @editCard="handleEditCard"
              @deleteCard="(cardId) => handleDeleteCard(cardId, list.id)"
              @editList="(updatedData) => handleEditList(list.id, updatedData)"
              @deleteList="() => handleDeleteListRequest(list.id)"
              @reorderCards="(cardIds) => handleReorderCards(list.id, cardIds)"
              @moveCard="handleMoveCard"
          />
        </template>
      </draggable>
    </template>

    <UModal :open="showDeleteConfirm" @close="cancelDelete">
      <template #content>
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">Confirm Delete</h3>
          <p>Are you sure you want to delete this list? This action cannot be undone.</p>
          <div class="mt-4 flex justify-end space-x-2">
            <UButton @click="cancelDelete">Cancel</UButton>
            <UButton color="red" @click="handleDeleteList">Delete</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>