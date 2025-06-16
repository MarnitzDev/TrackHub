<script setup lang="ts">
import { Board } from '@prisma/client'
import { useBoard } from '~/composables/useBoard'

interface Props {
  board: Board;
  onEdit?: (board: Board) => void;
}

const props = defineProps<Props>()
const emit = defineEmits(['refresh'])

const { deleteBoard } = useBoard()

const actions = ref([
  [
    {
      label: "Edit",
      icon: "i-heroicons-pencil",
      click: () => {
        props.onEdit?.(props.board)
      },
    },
  ],
  [
    {
      label: "Delete",
      icon: "i-heroicons-trash",
      click: async () => {
        await deleteBoard(props.board.id)
        emit('refresh')
      },
    },
  ],
])
</script>

<template>
  <div class="shadow dark:bg-gray-800 rounded-lg overflow-hidden relative">
    <div v-if="board.coverImage" class="h-36 w-full relative z-[1]">
      <img
          :src="board.coverImage"
          :alt="board.title"
          class="h-full w-full absolute object-cover z-[1]"
      />
      <div
          class="absolute w-full h-full z-[2] bg-gradient-to-b from-black/90 to-transparent"
      ></div>
    </div>

    <div class="flex items-center gap-2 absolute left-0 z-10 top-0 py-2 px-4">
      <NuxtLink
          :to="`/board/${board.id}`"
          class="block font-semibold text-white"
      >
        {{ board.title }}
      </NuxtLink>
      <UDropdown :items="actions">
        <UIcon name="i-heroicons-cog-6-tooth" class="text-white"></UIcon>
      </UDropdown>
    </div>
  </div>
</template>

<style scoped>
/* Add any scoped styles here if needed */
</style>