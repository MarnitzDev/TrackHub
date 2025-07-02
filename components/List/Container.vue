<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import draggable from 'vuedraggable'
import { Board, List, Card } from '@prisma/client'
import { useListStore } from '~/stores/listStore'
import { useCardStore } from '~/stores/cardStore'
import ListItem from './Item.vue'
import { useRoute } from 'vue-router'

// Props
interface Props {
  boardId: string
}

const props = defineProps<Props>()

// Stores and Route
const listStore = useListStore()
const cardStore = useCardStore()
const route = useRoute()
const { lists, loading, error } = storeToRefs(listStore)

// Computed Properties
// -----------------------------
const safeLists = computed(() => {
  return Array.isArray(lists.value) ? lists.value : []
})

// Lifecycle Hooks
// -----------------------------
onMounted(async () => {
  const boardId = route.params.id as string
  console.log("Component: Fetching lists for boardId:", boardId)
  if (boardId) {
    await listStore.fetchLists(boardId)
  } else {
    console.error("No boardId available in route params")
  }
})

//=============================================================================
// List Management
//=============================================================================

const handleListChange = async (event: any) => {
  console.log('List change event:', event);
  if (event.moved) {
    const newOrder = safeLists.value.map((list, index) => ({ id: list.id, order: index }));
    console.log('New list order:', newOrder);
    try {
      // Use props.boardId instead of route.params.id
      await listStore.reorderLists(props.boardId, newOrder);
      console.log('Lists reordered successfully');
    } catch (error) {
      console.error('Error reordering lists:', error);
      // Optionally, revert the change in the UI
      await listStore.fetchLists(props.boardId);
    }
  }
}

const handleEditList = async (listId: string, updatedData: Partial<List>) => {
  console.log('handleEditList called with listId:', listId, 'and updatedData:', updatedData);
  try {
    await listStore.editList(listId, updatedData)
    console.log('List updated successfully')
    // The UI will automatically update due to the reactive nature of the store
  } catch (error) {
    console.error('Error updating list:', error)
    // Handle error (e.g., show an error message to the user)
  }
}

//=============================================================================
// Card Management
//=============================================================================

const handleCreateCard = async (listId: string, cardData: Partial<Card>) => {
  console.log('handleCreateCard called with listId:', listId, 'and cardData:', cardData);
  try {
    await cardStore.createCard({ ...cardData, listId })
    console.log('Card created successfully')
  } catch (error) {
    console.error('Error creating card:', error)
    // Handle error (e.g., show an error message to the user)
  }
}

const handleEditCard = async (cardId: string, updatedData: Partial<Card>) => {
  console.log('handleEditCard called with cardId:', cardId, 'and updatedData:', updatedData);
  try {
    await cardStore.updateCard({ id: cardId, ...updatedData })
    console.log('Card updated successfully')
  } catch (error) {
    console.error('Error updating card:', error)
    // Handle error (e.g., show an error message to the user)
  }
}

const handleDeleteCard = async (cardId: string, listId: string) => {
  console.log('handleDeleteCard called with cardId:', cardId, 'and listId:', listId);
  try {
    await cardStore.deleteCard(cardId)
    console.log('Card deleted successfully')
  } catch (error) {
    console.error('Error deleting card:', error)
    // Handle error (e.g., show an error message to the user)
  }
}

const handleReorderCards = async (listId: string, cardIds: string[]) => {
  console.log('handleReorderCards called with listId:', listId, 'and cardIds:', cardIds);
  try {
    await cardStore.reorderCards(listId, cardIds)
    console.log('Cards reordered successfully')
  } catch (error) {
    console.error('Error reordering cards:', error)
    // Handle error (e.g., show an error message to the user)
  }
}

const handleMoveCard = async (payload: { cardId: string, fromListId: string, toListId: string, newIndex: number }) => {
  console.log('handleMoveCard called with payload:', payload);
  try {
    await cardStore.moveCard(payload)
    console.log('Card moved successfully')
  } catch (error) {
    console.error('Error moving card:', error)
    // Handle error (e.g., show an error message to the user)
  }
}

//=============================================================================
// List Deletion
//=============================================================================

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
    // useToast().add({ title: 'Success', description: 'List deleted successfully', color: 'green' })
  } catch (error) {
    console.error('Error deleting list:', error)
    // useToast().add({ title: 'Error', description: 'Failed to delete list', color: 'red' })
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