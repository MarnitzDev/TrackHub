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
    boardStore.setCreateModalOpen(false)
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
    boardStore.setEditingBoard(null)
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
      <button
          @click="openCreateBoardModal"
          class="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg font-semibold"
          data-testid="create-board-button"
      >
        Create Your First Board
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <BoardCard
          v-for="board in boards"
          :key="board.id"
          :board="board"
          :backgroundImageUrl="getBackgroundImageUrl(board.backgroundImage)"
      />
    </div>

    <!-- New Board Button (when boards exist) -->
    <button
        v-if="boards.length > 0"
        @click="openCreateBoardModal"
        class="mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg font-semibold"
    >
      Create New Board
    </button>

    <!-- Create Board Modal -->
    <CreateBoardModal
        :open="isCreateModalOpen"
        @close="boardStore.setCreateModalOpen(false)"
        @create="handleCreateBoard"
    />

    <!-- Edit Board Modal -->
    <EditBoardModal
        :open="isEditModalOpen"
        :board="editingBoard"
        @close="boardStore.setEditingBoard(null)"
        @update="handleUpdateBoard"
    />
  </div>
</template>