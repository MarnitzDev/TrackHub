<script setup lang="ts">
import { ref, watch } from 'vue'
import { Board } from '@prisma/client'

const props = defineProps<{
  open: boolean
  loading: boolean
  board: Board | null
}>()

const emit = defineEmits(['close', 'update'])

const boardTitle = ref('')
const boardDescription = ref('')

watch(() => props.board, (newBoard) => {
  if (newBoard) {
    boardTitle.value = newBoard.title
    boardDescription.value = newBoard.description || ''
  }
}, { immediate: true })

const handleUpdateBoard = () => {
  if (!props.board || !boardTitle.value.trim()) return

  emit('update', {
    id: props.board.id,
    title: boardTitle.value,
    description: boardDescription.value
  })
}

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <UModal :open="open" @close="closeModal">
    <template #content>
      <div class="p-6">
        <h2 class="text-2xl font-bold mb-6">Edit Board</h2>
        <form @submit.prevent="handleUpdateBoard" class="space-y-6">
          <div>
            <label for="editBoardTitle" class="block text-sm font-medium text-gray-700 mb-1">Title:</label>
            <input
                id="editBoardTitle"
                v-model="boardTitle"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter board title"
            >
          </div>
          <div>
            <label for="editBoardDescription" class="block text-sm font-medium text-gray-700 mb-1">Description:</label>
            <textarea
                id="editBoardDescription"
                v-model="boardDescription"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Enter board description (optional)"
            ></textarea>
          </div>
          <div class="flex justify-end space-x-3">
            <button
                type="button"
                @click="closeModal"
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
</template>