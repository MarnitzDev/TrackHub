<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useBoardStore } from '~/stores/boardStore'
import BoardCard from '~/components/Board/Item.vue'

// Store and Shared State
// -----------------------------
const boardStore = useBoardStore()
const { boards, loading, error, editingBoard } = storeToRefs(boardStore)

const newBoardTitle = ref('')
const newBoardDescription = ref('')

//=============================================================================
// Create Board Logic
//=============================================================================

const showCreateBoardModal = ref(false)

const handleCreateBoard = async () => {
  if (!newBoardTitle.value.trim()) return

  try {
    await boardStore.createBoard({
      title: newBoardTitle.value,
      description: newBoardDescription.value
    })
    closeCreateModal()
    // toast.success('Board created successfully!')
  } catch (error) {
    console.error('Error creating board:', error)
    // toast.error('Failed to create board. Please try again.')
  }
}

const closeCreateModal = () => {
  showCreateBoardModal.value = false
  newBoardTitle.value = ''
  newBoardDescription.value = ''
}

//=============================================================================
// Edit Board Logic
//=============================================================================

const showEditBoardModal = computed(() => !!editingBoard.value)

const handleUpdateBoard = async () => {
  if (!editingBoard.value || !newBoardTitle.value.trim()) return

  try {
    await boardStore.updateBoard({
      id: editingBoard.value.id,
      title: newBoardTitle.value,
      description: newBoardDescription.value
    })
    closeEditModal()
    // toast.success('Board updated successfully!')
  } catch (error) {
    console.error('Error updating board:', error)
    // toast.error('Failed to update board. Please try again.')
  }
}

const closeEditModal = () => {
  boardStore.setEditingBoard(null)
  newBoardTitle.value = ''
  newBoardDescription.value = ''
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
          @click="showCreateBoardModal = true"
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
      />
    </div>

    <!-- New Board Button (when boards exist) -->
    <button
        v-if="boards.length > 0"
        @click="showCreateBoardModal = true"
        class="mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg font-semibold"
    >
      Create New Board
    </button>

    <!-- Create Board Modal -->
    <UModal :open="showCreateBoardModal" @close="closeCreateModal" data-testid="create-board-modal">
      <template #content>
        <div class="p-6">
          <h2 class="text-2xl font-bold mb-6">Create New Board</h2>
          <form @submit.prevent="handleCreateBoard" class="space-y-6">
            <div>
              <label for="newBoardTitle" class="block text-sm font-medium text-gray-700 mb-1">Title:</label>
              <input
                  id="newBoardTitle"
                  v-model="newBoardTitle"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter board title"
              >
            </div>
            <div>
              <label for="newBoardDescription" class="block text-sm font-medium text-gray-700 mb-1">Description:</label>
              <textarea
                  id="newBoardDescription"
                  v-model="newBoardDescription"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Enter board description (optional)"
              ></textarea>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                  type="button"
                  @click="closeCreateModal"
                  class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  :disabled="loading"
                  class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {{ loading ? 'Creating...' : 'Create Board' }}
              </button>
            </div>
          </form>
        </div>
      </template>
    </UModal>

    <!-- Edit Board Modal -->
    <UModal :open="showEditBoardModal" @close="closeEditModal">
      <template #content>
        <div class="p-6">
          <h2 class="text-2xl font-bold mb-6">Edit Board</h2>
          <form @submit.prevent="handleUpdateBoard" class="space-y-6">
            <div>
              <label for="editBoardTitle" class="block text-sm font-medium text-gray-700 mb-1">Title:</label>
              <input
                  id="editBoardTitle"
                  v-model="newBoardTitle"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter board title"
              >
            </div>
            <div>
              <label for="editBoardDescription" class="block text-sm font-medium text-gray-700 mb-1">Description:</label>
              <textarea
                  id="editBoardDescription"
                  v-model="newBoardDescription"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Enter board description (optional)"
              ></textarea>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                  type="button"
                  @click="closeEditModal"
                  class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  :disabled="loading"
                  class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {{ loading ? 'Updating...' : 'Update Board' }}
              </button>
            </div>
          </form>
        </div>
      </template>
    </UModal>
  </div>
</template>