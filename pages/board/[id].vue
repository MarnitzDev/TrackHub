<script setup lang="ts">
import { ref, computed } from 'vue'
import { Board, List, Card } from '@prisma/client'
import ListContainer from '~/components/List/Container.vue'
// import { useToast } from '@nuxt/ui'

interface ListWithCards extends List {
  cards: Card[]
}

interface BoardWithLists extends Board {
  lists: ListWithCards[]
}

const route = useRoute()
const boardId = route.params.id as string

const { data: board, refresh } = await useFetch<BoardWithLists>(`/api/boards/${boardId}`)

const showCreateListModal = ref(false)
const newListTitle = ref('')

const showCreateCardModal = ref(false)
const newCardTitle = ref('')
const newCardDescription = ref('')
const activeListId = ref<string | null>(null)

const editingCard = ref<Card | null>(null)

watch(() => board.value, (newBoard) => {
  console.log('Board data:', JSON.stringify(newBoard, null, 2))
}, { immediate: true, deep: true })

const createList = async () => {
  await $fetch(`/api/lists`, {
    method: 'POST',
    body: { title: newListTitle.value, boardId }
  })
  await refresh()
  showCreateListModal.value = false
  newListTitle.value = ''
}

const openCreateCardModal = (listId: string) => {
  activeListId.value = listId
  editingCard.value = null
  newCardTitle.value = ''
  newCardDescription.value = ''
  showCreateCardModal.value = true
}

const updateCardList = async ({ cardId, newListId, newIndex, oldListId }) => {
  if (!board.value) return

  // Optimistic update
  const oldList = board.value.lists.find(list => list.id === oldListId)
  const newList = board.value.lists.find(list => list.id === newListId)
  const card = oldList?.cards.find(c => c.id === cardId)

  if (oldList && newList && card) {
    oldList.cards = oldList.cards.filter(c => c.id !== cardId)
    newList.cards.splice(newIndex, 0, { ...card, listId: newListId })

    // Update order of cards in both old and new lists
    oldList.cards.forEach((c, index) => {
      c.order = index
    })
    newList.cards.forEach((c, index) => {
      c.order = index
    })
  }

  try {
    await $fetch(`/api/cards/${cardId}`, {
      method: 'PUT',
      body: { listId: newListId, order: newIndex }
    })
  } catch (error) {
    console.error('Error updating card list:', error)
    // useToast().add({
    //   title: 'Error',
    //   description: 'Failed to update card position. Changes will be reverted.',
    //   color: 'red'
    // })
    await refresh()
  }
}

const reorderCards = async ({ listId, cardIds }) => {
  if (!board.value) return

  // Optimistic update
  const list = board.value.lists.find(l => l.id === listId)
  if (list) {
    list.cards = cardIds.map((id, index) => {
      const card = list.cards.find(c => c.id === id)
      return card ? { ...card, order: index } : null
    }).filter(Boolean) as Card[]
  }

  try {
    await $fetch(`/api/lists/${listId}/reorder`, {
      method: 'PUT',
      body: { cardIds }
    })
  } catch (error) {
    console.error('Error reordering cards:', error)
    // useToast().add({
    //   title: 'Error',
    //   description: 'Failed to reorder cards. Changes will be reverted.',
    //   color: 'red'
    // })
    await refresh()
  }
}

</script>

<template>
  <div v-if="board" class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">{{ board.title }}</h1>

    <ListContainer
        v-if="board.lists"
        :lists="board.lists"
        @createCard="openCreateCardModal"
        @editCard="editCard"
        @deleteCard="deleteCard"
        @updateCardList="updateCardList"
        @reorderCards="reorderCards"
    />

    <button @click="showCreateListModal = true" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
      Add New List
    </button>

    <!-- Create List Modal -->
    <UModal :open="showCreateListModal">
      <template #body>
        <div class="p-4">
          <h2 class="text-2xl font-bold mb-4">Create New List</h2>
          <form @submit.prevent="createList">
            <input v-model="newListTitle" type="text" placeholder="List Title" class="w-full p-2 border rounded mb-4">
            <div class="flex justify-end">
              <UButton type="button" @click="showCreateListModal = false" class="mr-2">Cancel</UButton>
              <UButton type="submit" color="primary">Create</UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>

    <!-- Create/Edit Card Modal -->
    <UModal :open="showCreateCardModal">
      <template #body>
        <div class="p-4">
          <h2 class="text-2xl font-bold mb-4">{{ editingCard ? 'Edit Card' : 'Create New Card' }}</h2>
          <form @submit.prevent="editingCard ? updateCard() : createCard()">
            <input v-model="newCardTitle" type="text" placeholder="Card Title" class="w-full p-2 border rounded mb-4">
            <textarea v-model="newCardDescription" placeholder="Card Description" class="w-full p-2 border rounded mb-4"></textarea>
            <div class="flex justify-end">
              <UButton type="button" @click="showCreateCardModal = false" class="mr-2">Cancel</UButton>
              <UButton type="submit" color="primary">{{ editingCard ? 'Update' : 'Create' }}</UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>
  </div>
</template>