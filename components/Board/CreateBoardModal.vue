<script setup lang="ts">
import { ref } from 'vue'
import { useBoardStore } from '~/stores/boardStore'

// Store
const boardStore = useBoardStore()

// Reactive references for form inputs
const newBoardTitle = ref('')
const newBoardDescription = ref('')
const selectedBackground = ref('')

// List of background images for selection
const backgroundImages = [
  { id: 'bg1', url: '/images/board-backgrounds/bg1.jpg' },
  { id: 'bg2', url: '/images/board-backgrounds/bg2.jpg' },
  { id: 'bg3', url: '/images/board-backgrounds/bg3.jpg' },
  { id: 'bg4', url: '/images/board-backgrounds/bg4.jpg' },
  { id: 'bg5', url: '/images/board-backgrounds/bg5.jpg' },
]

// Function to handle board creation
const handleCreateBoard = async () => {
  try {
    await boardStore.createBoard({
      title: newBoardTitle.value,
      description: newBoardDescription.value,
      backgroundImage: selectedBackground.value
    })
    closeModal()
  } catch (error) {
    console.error('Failed to create board:', error)
    // Handle error (e.g., show error message to user)
  }
}

// Function to close the modal and reset form
const closeModal = () => {
  newBoardTitle.value = ''
  newBoardDescription.value = ''
  selectedBackground.value = ''
  boardStore.setCreateModalOpen(false)
}
</script>

<template>
  <UModal :open="boardStore.isCreateModalOpen" @close="closeModal" data-testid="create-board-modal">
    <template #content>
      <div class="p-6">
        <h2 class="text-2xl font-bold mb-6">Create New Board</h2>
        <form @submit.prevent="handleCreateBoard" class="space-y-6">
          <!-- Board Title Input -->
          <div>
            <label for="newBoardTitle" class="block text-sm font-medium text-gray-700 mb-1">Title:</label>
            <UInput
                id="newBoardTitle"
                v-model="newBoardTitle"
                required
                size="xl"
                class="w-full"
                placeholder="Enter board title"
            />
          </div>

          <!-- Board Description Input -->
          <div>
            <label for="newBoardDescription" class="block text-sm font-medium text-gray-700 mb-1">Description:</label>
            <UTextarea
                id="newBoardDescription"
                v-model="newBoardDescription"
                class="w-full"
                rows="3"
                placeholder="Enter board description (optional)"
            />
          </div>

          <!-- Background Image Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Background Image:</label>
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
            <UButton
                @click="closeModal"
                color="gray"
            >
              Cancel
            </UButton>
            <UButton
                type="submit"
                color="primary"
                :loading="boardStore.loading"
                :disabled="boardStore.loading || !newBoardTitle"
            >
              {{ boardStore.loading ? 'Creating...' : 'Create Board' }}
            </UButton>
          </div>
        </form>
      </div>
    </template>
  </UModal>
</template>