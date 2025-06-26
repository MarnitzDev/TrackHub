<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['close', 'create'])

const props = defineProps<{
  open: boolean
  loading: boolean
}>()

const newBoardTitle = ref('')
const newBoardDescription = ref('')
const selectedBackground = ref('')

const backgroundImages = [
  { id: 'bg1', url: '/images/board-backgrounds/bg1.jpg' },
  { id: 'bg2', url: '/images/board-backgrounds/bg2.jpg' },
  { id: 'bg3', url: '/images/board-backgrounds/bg3.jpg' },
  { id: 'bg4', url: '/images/board-backgrounds/bg4.jpg' },
  { id: 'bg5', url: '/images/board-backgrounds/bg5.jpg' },
]

const handleCreateBoard = () => {
  const boardData = {
    title: newBoardTitle.value,
    description: newBoardDescription.value,
  }

  if (selectedBackground.value) {
    boardData['backgroundImage'] = selectedBackground.value
  }

  emit('create', boardData)
}

const closeModal = () => {
  newBoardTitle.value = ''
  newBoardDescription.value = ''
  selectedBackground.value = ''
  emit('close')
}
</script>

<template>
  <UModal :open="open" @close="closeModal" data-testid="create-board-modal">
    <template #content>
      <div class="p-6">
        <h2 class="text-2xl font-bold mb-6">Create New Board</h2>
        <form @submit.prevent="handleCreateBoard" class="space-y-6">
          <!-- Board Title Input -->
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

          <!-- Board Description Input -->
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

          <!-- Background Image Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Background Image (optional):</label>
            <div class="grid grid-cols-5 gap-2">
              <div
                  v-for="bg in backgroundImages"
                  :key="bg.id"
                  @click="selectedBackground = bg.url"
                  class="cursor-pointer rounded-md overflow-hidden border-2 transition-all duration-200"
                  :class="{ 'border-blue-500 ring-2 ring-blue-500': selectedBackground === bg.url, 'border-transparent hover:border-gray-300': selectedBackground !== bg.url }"
              >
                <img :src="bg.url" :alt="bg.id" class="w-full h-16 object-cover">
              </div>
            </div>
          </div>

          <!-- Form Actions -->
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
                :disabled="loading || !newBoardTitle"
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