<script setup lang="ts">
import { ref } from 'vue'
import { Board } from '@prisma/client'
// import { useBoard } from '~/composables/useBoard'

interface Props {
  board: Board;
  onEdit?: (board: Board) => void;
}

const props = defineProps<Props>()
const emit = defineEmits(['refresh'])

// const { deleteBoard } = useBoard()

const isDeleting = ref(false)
const showDeleteConfirm = ref(false)

const actions = ref([
  [
    {
      label: "Edit",
      icon: "i-lucide-pencil",
      click: () => {
        props.onEdit?.(props.board)
      },
    },
  ],
  [
    {
      label: "Delete",
      icon: "i-lucide-trash-2",
      click: () => {
        showDeleteConfirm.value = true
      },
    },
  ],
])

const confirmDelete = async () => {
  try {
    isDeleting.value = true
    // await deleteBoard(props.board.id)
    emit('refresh')
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
  <div class="shadow dark:bg-gray-800 rounded-lg overflow-hidden relative">
    <!-- Board content -->
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
        <NuxtLink
            :to="`/board/${board.id}`"
            class="font-semibold text-white text-lg hover:underline"
        >
          {{ board.title }}
        </NuxtLink>
        <UDropdownMenu :items="actions"  :content="{ align: 'start' }" :ui="{ content: 'w-48' }">
          <UButton color="neutral" variant="subtle" icon="i-lucide-settings" />
        </UDropdownMenu>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <UModal :open="showDeleteConfirm">
      <template #content>
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">Confirm Delete</h3>
          <p>Are you sure you want to delete this board?</p>
          <div class="mt-4 flex justify-end gap-2">
            <UButton @click="showDeleteConfirm = false">Cancel</UButton>
            <UButton color="red" :loading="isDeleting" @click="confirmDelete">Delete</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>