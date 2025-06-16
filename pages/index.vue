<script setup lang="ts">
import { ref } from 'vue'
import { Board } from '@prisma/client'

const { data: boards, refresh } = await useFetch<Board[]>('/api/boards')

const showCreateBoardModal = ref(false)
const newBoardTitle = ref('')
const newBoardDescription = ref('')

const createBoard = async () => {
  if (!newBoardTitle.value) {
    alert('Title is required')
    return
  }

  try {
    await $fetch('/api/boards', {
      method: 'POST',
      body: {
        title: newBoardTitle.value,
        description: newBoardDescription.value
      }
    })
    refresh()
    showCreateBoardModal.value = false
    newBoardTitle.value = ''
    newBoardDescription.value = ''
  } catch (error) {
    console.error('Error creating board:', error)
    alert('Failed to create board')
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">My Boards</h1>
      <button @click="showCreateBoardModal = true" class="bg-blue-500 text-white px-4 py-2 rounded">
        Create Board
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="board in boards" :key="board.id" class="bg-white p-4 rounded shadow">
        <NuxtLink :to="`/board/${board.id}`" class="text-xl font-semibold hover:text-blue-500">
          {{ board.title }}
        </NuxtLink>
        <p class="text-gray-600">{{ board.description }}</p>
      </div>
    </div>

    <!-- Create Board Modal -->
    <div v-if="showCreateBoardModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg">
        <h2 class="text-2xl font-bold mb-4">Create New Board</h2>
        <form @submit.prevent="createBoard">
          <input v-model="newBoardTitle" type="text" placeholder="Board Title" class="w-full p-2 border rounded mb-4" required>
          <textarea v-model="newBoardDescription" placeholder="Board Description" class="w-full p-2 border rounded mb-4"></textarea>
          <div class="flex justify-end">
            <button type="button" @click="showCreateBoardModal = false" class="mr-2 px-4 py-2 text-gray-600">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">Create</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>