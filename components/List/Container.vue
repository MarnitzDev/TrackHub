<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import draggable from 'vuedraggable'
import { List, Card } from '@prisma/client'
import { useListStore } from '~/stores/listStore'
import { useCardStore } from '~/stores/cardStore'
import ListItem from './Item.vue'

interface Props {
  boardId: string
}

const props = defineProps<Props>()

const listStore = useListStore()
const cardStore = useCardStore()
const { loading, error } = storeToRefs(listStore)

const sortedLists = computed(() => listStore.sortedLists)
const isReordering = ref(false)
const containerHeight = ref('100vh')
const showCreateListModal = ref(false)
const newListTitle = ref('')
const hasLists = computed(() => sortedLists.value.length > 0)

const updateContainerHeight = () => {
  const headerHeight = 64 // Adjust this value based on your actual header height
  const footerHeight = 57 // Adjust this value based on your actual footer height
  containerHeight.value = `calc(100vh - ${headerHeight}px - ${footerHeight}px)`
}

onMounted(async () => {
  if (props.boardId) {
    await listStore.fetchLists(props.boardId)
  } else {
    console.error("No boardId available in props")
  }
  updateContainerHeight()
  window.addEventListener('resize', updateContainerHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerHeight)
})

const handleListChange = async (event: any) => {
  if (event.moved) {
    const { newIndex, element } = event.moved
    await listStore.reorderLists(props.boardId, sortedLists.value.map((list, index) => ({
      id: list.id,
      order: index
    })))
  }
}

const createList = async () => {
  if (!props.boardId) return

  const newListOrder = sortedLists.value.length
  try {
    await listStore.createList({
      title: newListTitle.value,
      boardId: props.boardId,
      order: newListOrder
    })

    showCreateListModal.value = false
    newListTitle.value = ''
  } catch (error) {
    console.error('Error creating list:', error)
  }
}
</script>

<template>
  <div class="board-container" :style="{ height: containerHeight }">
    <p v-if="loading">Loading lists...</p>
    <p v-else-if="error">Error: {{ error }}</p>
    <template v-else>
      <div v-if="isReordering" class="fixed top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 z-50">
        Reordering lists...
      </div>
      <div class="lists-wrapper">
        <draggable
            v-if="hasLists"
            :list="sortedLists"
            item-key="id"
            class="lists-container"
            handle=".list-handle"
            @change="handleListChange"
            :disabled="isReordering"
        >
          <template #item="{ element: list }">
            <ListItem
                :list="list"
                :boardId="props.boardId"
                :is-reordering="isReordering"
                @createCard="(cardData) => cardStore.createCard({ ...cardData, listId: list.id })"
                @editCard="cardStore.updateCard"
                @deleteCard="(cardId) => cardStore.deleteCard(cardId)"
                @editList="(updatedData) => listStore.editList(props.boardId, list.id, updatedData)"
                @deleteList="() => listStore.deleteList(props.boardId, list.id)"
                @reorderCards="(cardIds) => listStore.reorderCards({ listId: list.id, cardIds })"
                @moveCard="cardStore.moveCard"
            />
          </template>
        </draggable>

        <!-- Add New List Button or Create First List -->
        <div :class="['add-list-wrapper', { 'first-list': !hasLists }]">
          <UButton
              @click="showCreateListModal = true"
              variant="ghost"
              color="neutral"
              class="add-list-button py-2 px-4"
          >
            <template #leading>
              <UIcon name="i-heroicons-plus" class="mr-1" />
            </template>
            {{ hasLists ? 'Add another list' : 'Add a list' }}
          </UButton>
        </div>
      </div>
    </template>

    <!-- Create List Modal -->
    <UModal :open="showCreateListModal" @close="showCreateListModal = false">
      <template #content>
        <div class="p-4">
          <h2 class="text-2xl font-bold mb-4">Create New List</h2>
          <form @submit.prevent="createList">
            <UInput v-model="newListTitle" type="text" placeholder="List Title" size="xl" class="w-full" />
            <div class="flex justify-end mt-4">
              <UButton type="button" @click="showCreateListModal = false" class="mr-2" color="neutral" variant="ghost">Cancel</UButton>
              <UButton type="submit" color="primary">Create</UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.board-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 100%;
  max-height: calc(100vh - 235px);
}

.lists-wrapper {
  flex-grow: 1;
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  align-items: flex-start;
}

.lists-container {
  display: inline-flex;
  height: 100%;
  align-items: flex-start;
}

.add-list-wrapper {
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: 3px;
}

.add-list-button {
  color: white;
  font-weight: 400;
  text-align: left;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-list-button:hover {
  background-color: white;
}

/* Customizing the scrollbar for horizontal list scrolling */
.lists-wrapper::-webkit-scrollbar {
  height: 14px;
}

.lists-wrapper::-webkit-scrollbar-track {
  background-color: rgba(255, 255, 255, 0.3);
}

.lists-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  border: 3px solid transparent;
  background-clip: padding-box;
  transition: background-color 0.3s ease;
}

.lists-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .lists-wrapper {
    padding: 10px;
  }
}
</style>