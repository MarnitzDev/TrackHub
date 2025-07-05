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
const isReordering = ref(false)
const showDeleteConfirm = ref(false)
const listToDelete = ref<string | null>(null)

onMounted(async () => {
  if (props.boardId) {
    await listStore.fetchLists(props.boardId)
  } else {
    console.error("No boardId available in props")
  }
})

const handleListChange = async (event: any) => {
  if (event.moved && !isReordering.value) {
    isReordering.value = true
    const newOrder = sortedLists.value.map((list, index) => ({ id: list.id, order: index }))

    // Optimistic update
    listStore.updateListOrder(newOrder)

    try {
      await listStore.reorderLists(props.boardId, newOrder)
    } catch (error) {
      console.error('Error reordering lists:', error)
      await listStore.fetchLists(props.boardId)
    } finally {
      isReordering.value = false
    }
  }
}

const handleCreateCard = async (listId: string, cardData: Partial<Card>) => {
  await cardStore.createCard(listId, cardData)
}

const handleEditCard = async (cardId: string, updatedData: Partial<Card>) => {
  await cardStore.editCard(cardId, updatedData)
}

const handleDeleteCard = async (cardId: string, listId: string) => {
  await cardStore.deleteCard(cardId, listId)
}

const handleEditList = async (listId: string, updatedData: Partial<List>) => {
  await listStore.editList(props.boardId, listId, updatedData)
}

const handleDeleteListRequest = (listId: string) => {
  listToDelete.value = listId
  showDeleteConfirm.value = true
}

const handleDeleteList = async () => {
  if (listToDelete.value) {
    await listStore.deleteList(props.boardId, listToDelete.value)
    showDeleteConfirm.value = false
    listToDelete.value = null
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  listToDelete.value = null
}

const handleReorderCards = async (listId: string, cardIds: string[]) => {
  await listStore.reorderCards({ listId, cardIds })
}

const handleMoveCard = async (payload: { cardId: string, fromListId: string, toListId: string, newIndex: number }) => {
  await cardStore.moveCard(payload)
}
</script>

<template>
  <div>
    <p v-if="loading">Loading lists...</p>
    <p v-else-if="error">Error: {{ error }}</p>
    <template v-else>
      <div v-if="isReordering" class="fixed top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 z-50">
        Reordering lists...
      </div>
      <draggable
          :list="sortedLists"
          item-key="id"
          class="flex space-x-4 overflow-x-auto"
          handle=".list-handle"
          @change="handleListChange"
          :disabled="isReordering"
      >
        <template #item="{ element: list }">
          <ListItem
              :list="list"
              :boardId="props.boardId"
              :is-reordering="isReordering"
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