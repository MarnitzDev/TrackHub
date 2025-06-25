<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['close', 'create'])

const props = defineProps<{
  open: boolean
  loading: boolean
}>()

const newBoardTitle = ref('')
const newBoardDescription = ref('')

const handleCreateBoard = () => {
  emit('create', {
    title: newBoardTitle.value,
    description: newBoardDescription.value
  })
}

const closeModal = () => {
  newBoardTitle.value = ''
  newBoardDescription.value = ''
  emit('close')
}
</script>

<template>
  <UModal :open="open" @close="closeModal" data-testid="create-board-modal">
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
              {{ loading ? 'Creating...' : 'Create Board' }}
            </button>
          </div>
        </form>
      </div>
    </template>
  </UModal>
</template>