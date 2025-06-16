<script setup lang="ts">
import { ref } from 'vue'
import { Board, List } from '@prisma/client'

const route = useRoute()
const boardId = route.params.id as string

const { data: board, refresh } = await useFetch<Board & { lists: List[] }>(`/api/boards/${boardId}`)

const showCreateListModal = ref(false)
const newListTitle = ref('')

const createList = async () => {
  await $fetch(`/api/lists`, {
    method: 'POST',
    body: { title: newListTitle.value, boardId: route.params.id }
  })
  await refresh()
  showCreateListModal.value = false
  newListTitle.value = ''
}
</script>

<template>
  <div v-if="board" class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">{{ board.title }}</h1>

    <div class="flex space-x-4 overflow-x-auto">
      <div v-for="list in board.lists" :key="list.id" class="bg-gray-100 p-4 rounded min-w-[250px]">
        <h2 class="text-xl font-semibold mb-2">{{ list.title }}</h2>
        <!-- Add cards here -->
      </div>

      <button @click="showCreateListModal = true" class="bg-gray-200 p-4 rounded min-w-[250px] text-left">
        + Add another list
      </button>
    </div>

    <!-- Create List Modal -->
    <div v-if="showCreateListModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg">
        <h2 class="text-2xl font-bold mb-4">Create New List</h2>
        <form @submit.prevent="createList">
          <input v-model="newListTitle" type="text" placeholder="List Title" class="w-full p-2 border rounded mb-4">
          <div class="flex justify-end">
            <button type="button" @click="showCreateListModal = false" class="mr-2 px-4 py-2 text-gray-600">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">Create</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>