<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Board } from '@prisma/client'
import BoardCard from '~/components/Board/Item.vue'
import { useBoard } from '~/composables/useBoard'

const { boards, loading, fetchBoards, createBoard } = useBoard()

const showCreateBoardModal = ref(false)
const newBoardTitle = ref('')
const newBoardDescription = ref('')

const handleEditBoard = (board: Board) => {
  // Implement edit functionality
  console.log('Edit board:', board)
}

const handleCreateBoard = async () => {
  if (!newBoardTitle.value.trim()) return

  try {
    await createBoard({
      title: newBoardTitle.value,
      description: newBoardDescription.value
    })
    newBoardTitle.value = ''
    newBoardDescription.value = ''
    showCreateBoardModal.value = false
    await fetchBoards()
  } catch (error) {
    console.error('Error creating board:', error)
    // You might want to show an error message to the user here
  }
}

onMounted(fetchBoards)
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">Your Boards</h2>
    <div v-if="loading">Loading...</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <BoardCard
          v-for="board in boards"
          :key="board.id"
          :board="board"
          :onEdit="handleEditBoard"
          @refresh="fetchBoards"
      />
    </div>
    <!-- New Board Button -->
    <button
        @click="showCreateBoardModal = true"
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      Create New Board
    </button>

    <!-- Create Board Modal -->
    <UModal :open="showCreateBoardModal">
      <template #body>
        <h2 class="text-xl font-bold mb-4">Create New Board</h2>
        <form @submit.prevent="handleCreateBoard" class="space-y-4">
          <div>
            <label for="boardTitle" class="block mb-1">Title:</label>
            <input
                id="boardTitle"
                v-model="newBoardTitle"
                required
                class="w-full px-3 py-2 border rounded"
            >
          </div>
          <div>
            <label for="boardDescription" class="block mb-1">Description:</label>
            <textarea
                id="boardDescription"
                v-model="newBoardDescription"
                class="w-full px-3 py-2 border rounded"
            ></textarea>
          </div>
          <div class="flex justify-end space-x-2">
            <button
                type="button"
                @click="showCreateBoardModal = false"
                class="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
                type="submit"
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Create Board
            </button>
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>