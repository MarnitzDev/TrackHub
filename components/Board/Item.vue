<script setup lang="ts">
import { ref } from 'vue'
import { Board } from '@prisma/client'
import { useBoardStore } from '~/stores/boardStore'

// Props and Store
// -----------------------------
interface Props {
  board: Board
  backgroundImageUrl: string | null
}

const props = defineProps<Props>()
const boardStore = useBoardStore()

// State
// -----------------------------
const isDeleting = ref(false)
const showDeleteConfirm = ref(false)

//=============================================================================
// Board Actions
//=============================================================================

const actions = ref([
  [
    {
      label: "Edit",
      icon: "i-lucide-pencil",
      key: `edit-board-button-${props.board.id}`,
      onSelect: () => {
        console.log('Edit board:', props.board);
        boardStore.setEditingBoard(props.board)
      },
    },
  ],
  [
    {
      label: "Delete",
      icon: "i-lucide-trash-2",
      onSelect: () => {
        showDeleteConfirm.value = true
      },
    },
  ],
])

//=============================================================================
// Delete Board Logic
//=============================================================================

const confirmDelete = async () => {
  try {
    isDeleting.value = true
    await boardStore.destroyBoard(props.board.id)
  } catch (error) {
    console.error('Failed to delete board:', error)
    // You might want to show an error message to the user here
  } finally {
    isDeleting.value = false
    showDeleteConfirm.value = false
  }
}
</script>

<template>
  <NuxtLink
      :to="`/board/${board.id}`"
      class="block shadow dark:bg-gray-800 rounded-lg overflow-hidden relative hover:shadow-lg transition-shadow duration-300"
      data-testid="board-card"
  >
    <div
        class="relative h-36"
        :style="backgroundImageUrl ? `background-image: url(${backgroundImageUrl}); background-size: cover; background-position: center;` : ''"
    >
      <div
          class="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent"
      ></div>
      <div class="absolute inset-x-0 bottom-0 py-2 px-4 flex justify-between items-center bg-white">
        <span class="font-semibold text-lg">
          {{ board.title }}
        </span>
        <UDropdownMenu
            :items="actions"
            :content="{ align: 'start' }"
            :ui="{ content: 'w-48' }"
            @click.stop
        >
          <UButton color="neutral" variant="ghost" icon="i-lucide-settings" @click.stop />
        </UDropdownMenu>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <UModal :open="showDeleteConfirm" @click.stop>
      <template #content>
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">Confirm Delete</h3>
          <p>Are you sure you want to delete this board?</p>
          <div class="mt-4 flex justify-end gap-2">
            <UButton @click.stop="showDeleteConfirm = false" color="neutral" variant="ghost">Cancel</UButton>
            <UButton :loading="isDeleting" @click.stop="confirmDelete" color="error" variant="soft">Delete</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </NuxtLink>
</template>