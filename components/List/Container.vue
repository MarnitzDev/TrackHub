<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import draggable from 'vuedraggable'
import { Board, List, Card } from '@prisma/client'
import { useListStore } from '~/stores/listStore'
import ListItem from './Item.vue'
import { useRoute } from 'vue-router'

interface Props {
  boardId: string
}

const props = defineProps<Props>()

const emit = defineEmits(['createCard', 'editCard', 'deleteCard', 'editList', 'deleteList', 'reorderCards', 'moveCard'])

const listStore = useListStore()
const route = useRoute()
const { lists, loading, error } = storeToRefs(listStore)

// Ensure lists is always an array
const safeLists = computed(() => {
  return Array.isArray(lists.value) ? lists.value : []
})

onMounted(async () => {
  const boardId = route.params.id as string
  console.log("Component: Fetching lists for boardId:", boardId)
  if (boardId) {
    await listStore.fetchLists(boardId)
  } else {
    console.error("No boardId available in route params")
  }
})

const handleListChange = async (event: any) => {
  console.log('List change event:', event);
  if (event.moved) {
    console.log('Lists reordered:', safeLists.value.map(list => ({ id: list.id, title: list.title })));
    await listStore.reorderLists(props.boardId, safeLists.value.map(list => list.id))
  }
}

const handleCreateCard = (listId: string, cardData: Partial<Card>) => {
  console.log('handleCreateCard called with listId:', listId, 'and cardData:', cardData);
  emit('createCard', { listId, cardData })
}

const handleEditCard = (cardId: string, updatedData: Partial<Card>) => {
  console.log('handleEditCard called with cardId:', cardId, 'and updatedData:', updatedData);
  emit('editCard', { cardId, updatedData })
}

const handleDeleteCard = (cardId: string, listId: string) => {
  console.log('handleDeleteCard called with cardId:', cardId, 'and listId:', listId);
  emit('deleteCard', { cardId, listId })
}

const handleEditList = (listId: string, updatedData: Partial<List>) => {
  console.log('handleEditList called with listId:', listId, 'and updatedData:', updatedData);
  emit('editList', { listId, updatedData })
}

const listToDelete = ref<string | null>(null)
const showDeleteConfirm = ref(false)

const handleDeleteListRequest = (listId: string) => {
  listToDelete.value = listId
  showDeleteConfirm.value = true
}

const handleDeleteList = async () => {
  if (!listToDelete.value) return

  console.log('handleDeleteList called with listId:', listToDelete.value)
  try {
    await listStore.deleteList(listToDelete.value)
    console.log('List deleted successfully')
    emit('listDeleted', listToDelete.value)
  } catch (error) {
    console.error('Error deleting list:', error)
    emit('listDeleteError', { listId: listToDelete.value, error })
  } finally {
    showDeleteConfirm.value = false
    listToDelete.value = null
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  listToDelete.value = null
}

const handleReorderCards = (listId: string, cardIds: string[]) => {
  console.log('handleReorderCards called with listId:', listId, 'and cardIds:', cardIds);
  emit('reorderCards', { listId, cardIds })
}

const handleMoveCard = (payload: { cardId: string, fromListId: string, toListId: string, newIndex: number }) => {
  console.log('handleMoveCard called with payload:', payload);
  emit('moveCard', payload)
}
</script>

<template>
  <div>
    <p v-if="loading">Loading lists...</p>
    <p v-else-if="error">Error: {{ error }}</p>
    <template v-else>
      <p>Number of lists: {{ safeLists.length }}</p>
      <draggable
          v-model="safeLists"
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
              @deleteList="handleDeleteListRequest"
              @reorderCards="handleReorderCards"
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