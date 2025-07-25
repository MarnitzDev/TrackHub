<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useBoardStore } from '~/stores/boardStore'
import BoardCard from '~/components/Board/Item.vue'
import CreateBoardModal from '~/components/Board/CreateBoardModal.vue'
import EditBoardModal from '~/components/Board/EditBoardModal.vue'

// Store and Shared State
// -----------------------------
const boardStore = useBoardStore()
const { boards, loading, error, editingBoard, isCreateModalOpen, isEditModalOpen } = storeToRefs(boardStore)

//=============================================================================
// Create Board Logic
//=============================================================================

const handleCreateBoard = async (boardData) => {
  try {
    await boardStore.createBoard(boardData)
    // toast.success('Board created successfully!')
  } catch (error) {
    console.error('Error creating board:', error)
    // toast.error('Failed to create board. Please try again.')
  }
}

const openCreateBoardModal = () => {
  boardStore.setCreateModalOpen(true)
}

const getBackgroundImageUrl = (imageName: string | null) => {
  if (imageName) {
    return `/images/board-backgrounds/${imageName}`
  }
  return null
}

//=============================================================================
// Edit Board Logic
//=============================================================================

const handleUpdateBoard = async (boardData) => {
  try {
    await boardStore.updateBoard(boardData)
    // toast.success('Board updated successfully!')
  } catch (error) {
    console.error('Error updating board:', error)
    // toast.error('Failed to update board. Please try again.')
  }
}

// Lifecycle Hooks
// -----------------------------
onMounted(() => boardStore.fetchBoards())
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h2 class="text-3xl font-bold mb-6">Your Boards</h2>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <p>Loading...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <div v-else-if="boards.length === 0" class="text-center py-10">
      <p class="text-xl text-gray-600">You don't have any boards yet.</p>
      <UButton
          @click="openCreateBoardModal"
          color="primary"
          size="lg"
          class="mt-4"
          data-testid="create-board-button"
      >
        <template #leading>
          <UIcon name="i-heroicons-plus" />
        </template>
        Create Your First Board
      </UButton>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <BoardCard
          v-for="board in boards"
          :key="board.id"
          :board="board"
          :backgroundImageUrl="getBackgroundImageUrl(board.backgroundImage)"
      />
    </div>

    <UButton
        v-if="boards.length > 0"
        @click="openCreateBoardModal"
        color="primary"
        size="lg"
        class="mt-8"
    >
      <template #leading>
        <UIcon name="i-heroicons-plus" />
      </template>
      Create New Board
    </UButton>

    <!-- Create Board Modal -->
    <CreateBoardModal />

    <!-- Edit Board Modal -->
    <EditBoardModal
        v-if="boardStore.editingBoard"
        :board="boardStore.editingBoard"
        @update="handleUpdateBoard"
    />
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}

@media (max-width: 640px) {
  .container {
    padding-left: 16px;
    padding-right: 16px;
  }
}

.grid {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.bg-red-100 {
  background-color: #fee2e2;
}

.border-red-400 {
  border-color: #f87171;
}

.text-red-700 {
  color: #b91c1c;
}

.bg-blue-500 {
  background-color: #3b82f6;
}

.hover\:bg-blue-600:hover {
  background-color: #2563eb;
}

.text-white {
  color: #ffffff;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>