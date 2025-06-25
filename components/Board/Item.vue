<script setup lang="ts">
import { ref } from 'vue'
import { Board } from '@prisma/client'
import { useBoardStore } from '~/stores/boardStore'

// Props and Store
// -----------------------------
interface Props {
  board: Board;
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
  >
    <div class="relative h-36">
      <img
          v-if="board.coverImage"
          :src="board.coverImage"
          :alt="board.title"
          class="w-full h-full object-cover"
      />
      <div
          class="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent"
      ></div>
      <div class="absolute inset-x-0 top-0 p-4 flex justify-between items-center">
        <span class="font-semibold text-white text-lg">
          {{ board.title }}
        </span>
        <UDropdownMenu
            :items="actions"
            :content="{ align: 'start' }"
            :ui="{ content: 'w-48' }"
            @click.stop
        >
          <UButton color="neutral" variant="subtle" icon="i-lucide-settings" @click.stop />
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
            <UButton @click.stop="showDeleteConfirm = false">Cancel</UButton>
            <UButton color="red" :loading="isDeleting" @click.stop="confirmDelete">Delete</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </NuxtLink>
</template>