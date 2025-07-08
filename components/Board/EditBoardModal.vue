<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Board } from '@prisma/client'
import { useBoardStore } from '~/stores/boardStore'

const props = defineProps<{
  board: Board | null
}>()

const boardStore = useBoardStore()

const boardTitle = ref('')
const boardDescription = ref('')
const selectedBackground = ref('')
const isOpen = computed(() => !!boardStore.editingBoard)

// List of background images for selection
const backgroundImages = [
  { id: 'bg1', url: '/images/board-backgrounds/bg1.jpg' },
  { id: 'bg2', url: '/images/board-backgrounds/bg2.jpg' },
  { id: 'bg3', url: '/images/board-backgrounds/bg3.jpg' },
  { id: 'bg4', url: '/images/board-backgrounds/bg4.jpg' },
  { id: 'bg5', url: '/images/board-backgrounds/bg5.jpg' },
]

watch(() => boardStore.editingBoard, (newBoard) => {
  if (newBoard) {
    boardTitle.value = newBoard.title
    boardDescription.value = newBoard.description || ''
    selectedBackground.value = newBoard.backgroundImage || ''
  }
}, { immediate: true })

const handleUpdateBoard = async () => {
  if (!boardStore.editingBoard || !boardTitle.value.trim()) return

  try {
    await boardStore.updateBoard({
      id: boardStore.editingBoard.id,
      title: boardTitle.value,
      description: boardDescription.value,
      backgroundImage: selectedBackground.value
    })
    closeModal()
  } catch (error) {
    console.error('Error updating board:', error)
    // Handle error (e.g., show an error message)
  }
}

const closeModal = () => {
  boardStore.setEditingBoard(null)
}
</script>

<template>
  <UModal :open="isOpen" @close="closeModal">
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

          <div class="flex justify-end space-x-3">
            <UButton
                type="button"
                color="neutral"
                variant="ghost"
                @click="closeModal"
            >
              Cancel
            </UButton>
            <UButton
                type="submit"
                color="primary"
                variant="soft"
                :disabled="boardStore.loading || !boardTitle || !selectedBackground"
            >
              {{ boardStore.loading ? 'Updating...' : 'Update Board' }}
            </UButton>
          </div>
        </form>
      </div>
    </template>
  </UModal>
</template>