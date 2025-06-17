<script setup lang="ts">
import { ref } from 'vue'
import { Board, List, Card } from '@prisma/client'
import CardItem from '~/components/Card/CardItem.vue'


const route = useRoute()
const boardId = route.params.id as string

const { data: board, refresh } = await useFetch<Board & { lists: List[] }>(`/api/boards/${boardId}`)

const showCreateListModal = ref(false)
const newListTitle = ref('')

const showCreateCardModal = ref(false)
const newCardTitle = ref('')
const newCardDescription = ref('')
const activeListId = ref<string | null>(null)

const createList = async () => {
  await $fetch(`/api/lists`, {
    method: 'POST',
    body: { title: newListTitle.value, boardId: route.params.id }
  })
  await refresh()
  showCreateListModal.value = false
  newListTitle.value = ''
}

const openCreateCardModal = (listId: string) => {
  activeListId.value = listId
  showCreateCardModal.value = true
}

const createCard = async () => {
  console.log('Creating card:', newCardTitle.value, newCardDescription.value, activeListId.value)

  if (!activeListId.value) return

  await $fetch(`/api/cards`, {
    method: 'POST',
    body: {
      title: newCardTitle.value,
      description: newCardDescription.value,
      listId: activeListId.value
    }
  })
  await refresh()
  showCreateCardModal.value = false
  newCardTitle.value = ''
  newCardDescription.value = ''
  activeListId.value = null
}

const editCard = (card: Card) => {
  // Implement edit functionality
  console.log('Edit card:', card)
}

const deleteCard = async (cardId: string) => {
  // Implement delete functionality
  console.log('Delete card:', cardId)
  try {
    await $fetch(`/api/cards/${cardId}`, {
      method: 'DELETE'
    })
    await refresh()
  } catch (error) {
    console.error('Error deleting card:', error)
  }
}
</script>

<template>
  <div v-if="board" class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">{{ board.title }}</h1>

    <div class="flex space-x-4 overflow-x-auto">
      <div v-for="list in board.lists" :key="list.id" class="bg-gray-100 p-4 rounded min-w-[250px]">
        <h2 class="text-xl font-semibold mb-2">{{ list.title }}</h2>
        <div class="space-y-2">
          <CardItem
              v-for="card in list.cards"
              :key="card.id"
              :card="card"
              @edit="editCard"
              @delete="deleteCard"
          />
          <button @click="openCreateCardModal(list.id)" class="w-full text-left p-2 text-gray-600 hover:bg-gray-200 rounded">
            + Add a card
          </button>
        </div>
      </div>
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

    <!-- Create Card Modal -->
    <div v-if="showCreateCardModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg">
        <h2 class="text-2xl font-bold mb-4">Create New Card</h2>
        <form @submit.prevent="createCard">
          <input v-model="newCardTitle" type="text" placeholder="Card Title" class="w-full p-2 border rounded mb-4">
          <textarea v-model="newCardDescription" placeholder="Card Description" class="w-full p-2 border rounded mb-4"></textarea>
          <div class="flex justify-end">
            <button type="button" @click="showCreateCardModal = false" class="mr-2 px-4 py-2 text-gray-600">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">Create</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>