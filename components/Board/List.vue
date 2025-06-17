<script setup lang="ts">
import { onMounted } from 'vue'
import { Board } from '@prisma/client'
import BoardCard from '~/components/Board/Item.vue'
import { useBoard } from '~/composables/useBoard'

const { boards, loading, fetchBoards } = useBoard()

const handleEditBoard = (board: Board) => {
  // Implement edit functionality
  console.log('Edit board:', board)
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
  </div>
</template>