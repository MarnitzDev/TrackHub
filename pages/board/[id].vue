<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Board, List, Card } from '@prisma/client'
import ListContainer from '~/components/List/Container.vue'
import { useBoardStore } from '~/stores/boardStore'
import { useListStore } from '~/stores/listStore'
import { useRoute } from 'vue-router'

// Types
interface ListWithCards extends List {
  cards: Card[]
}

interface BoardWithLists extends Board {
  lists: ListWithCards[]
}

// Stores
const boardStore = useBoardStore()
const listStore = useListStore()

// Route and Data Fetching
const route = useRoute()
const boardId = computed(() => route.params.id as string)

const { data: board, refresh, error: fetchError } = await useFetch<BoardWithLists>(() => `/api/boards/${boardId.value}`, {
  onResponseError({ response }) {
    console.error('Error fetching board:', response.statusText)
  }
})

// Error handling
const error = ref<string | null>(null)
watch(fetchError, (newError) => {
  if (newError) {
    console.error('Error fetching board:', newError)
    error.value = 'Failed to load board data. Please try again later.'
  } else {
    error.value = null
  }
})

// State
const newListTitle = ref('')
const showCreateCardModal = ref(false)
const newCardTitle = ref('')
const newCardDescription = ref('')
const activeListId = ref<string | null>(null)
const editingCard = ref<Card | null>(null)

const backgroundImageUrl = computed(() => {
  if (board.value?.backgroundImage) {
    return `/images/board-backgrounds/${board.value.backgroundImage}`
  }
  return null
})

// Watchers
watch(boardId, async () => {
  await refresh()
}, { immediate: true })

// List Management
const createList = async () => {
  if (!board.value) return

  const newListOrder = board.value.lists.length
  try {
    const newList = await listStore.createList({
      title: newListTitle.value,
      boardId: boardId.value,
      order: newListOrder
    })

    if (board.value) {
      board.value.lists.push(newList)
    }

    newListTitle.value = ''
  } catch (error) {
    console.error('Error creating list:', error)
  }
}

const reorderLists = async (newOrder: string[]) => {
  try {
    await $fetch(`/api/boards/${boardId.value}/reorder-lists`, {
      method: 'PUT',
      body: { listIds: newOrder }
    })
    await refresh()
  } catch (error) {
    console.error('Error reordering lists:', error)
  }
}

// Card Management
const openCreateCardModal = (listId: string) => {
  activeListId.value = listId
  editingCard.value = null
  newCardTitle.value = ''
  newCardDescription.value = ''
  showCreateCardModal.value = true
}

const updateCardList = async ({ cardId, fromListId, toListId, newIndex }) => {
  if (!board.value) return

  // Optimistic update
  const oldList = board.value.lists.find(list => list.id === fromListId)
  const newList = board.value.lists.find(list => list.id === toListId)
  const card = oldList?.cards.find(c => c.id === cardId)

  if (oldList && newList && card) {
    oldList.cards = oldList.cards.filter(c => c.id !== cardId)
    const updatedCard = { ...card, listId: toListId, order: newIndex }
    newList.cards.splice(newIndex, 0, updatedCard)

    oldList.cards.forEach((c, index) => { c.order = index })
    newList.cards.forEach((c, index) => { c.order = index })
  }

  try {
    await $fetch(`/api/cards/${cardId}`, {
      method: 'PUT',
      body: { listId: toListId, order: newIndex }
    })

    await $fetch(`/api/lists/${toListId}/reorder`, {
      method: 'PUT',
      body: { cardIds: newList?.cards.map(c => c.id) }
    })

    await refresh()
  } catch (error) {
    console.error('Error updating card list:', error)
    await refresh()
  }
}

const reorderCards = async ({ listId, cardIds }) => {
  if (!board.value) return

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
    await refresh()
  }
}

const editCard = (card: Card) => {
  editingCard.value = card
  newCardTitle.value = card.title
  newCardDescription.value = card.description || ''
  activeListId.value = card.listId
  showCreateCardModal.value = true
}

const deleteCard = async (cardId: string) => {
  if (!board.value) return

  const list = board.value.lists.find(l => l.cards.some(c => c.id === cardId))
  if (list) {
    list.cards = list.cards.filter(c => c.id !== cardId)
  }

  try {
    await $fetch(`/api/cards/${cardId}`, { method: 'DELETE' })
  } catch (error) {
    console.error('Error deleting card:', error)
    await refresh()
  }
}

const createCard = async () => {
  if (!activeListId.value || !board.value) return

  const newCard = {
    title: newCardTitle.value,
    description: newCardDescription.value,
    listId: activeListId.value,
    order: board.value.lists.find(l => l.id === activeListId.value)?.cards.length || 0
  }

  const list = board.value.lists.find(l => l.id === activeListId.value)
  if (list) {
    list.cards.push({ ...newCard, id: 'temp-id-' + Date.now() } as Card)
  }

  try {
    const createdCard = await $fetch('/api/cards', {
      method: 'POST',
      body: newCard
    })

    if (list) {
      const index = list.cards.findIndex(c => c.id === 'temp-id-' + Date.now())
      if (index !== -1) {
        list.cards[index] = createdCard
      }
    }
  } catch (error) {
    console.error('Error creating card:', error)
    await refresh()
  }

  showCreateCardModal.value = false
  newCardTitle.value = ''
  newCardDescription.value = ''
  activeListId.value = null
}

const updateCard = async () => {
  if (!editingCard.value || !board.value) return

  const updatedCard = {
    ...editingCard.value,
    title: newCardTitle.value,
    description: newCardDescription.value
  }

  const list = board.value.lists.find(l => l.id === editingCard.value?.listId)
  if (list) {
    const index = list.cards.findIndex(c => c.id === editingCard.value?.id)
    if (index !== -1) {
      list.cards[index] = updatedCard
    }
  }

  try {
    await $fetch(`/api/cards/${editingCard.value.id}`, {
      method: 'PUT',
      body: updatedCard
    })
  } catch (error) {
    console.error('Error updating card:', error)
    await refresh()
  }

  showCreateCardModal.value = false
  editingCard.value = null
  newCardTitle.value = ''
  newCardDescription.value = ''
}
</script>

<template>
  <div v-if="error" class="error-message p-4 bg-red-100 text-red-700 rounded">
    {{ error }}
  </div>
  <div
      v-else-if="board"
      class="min-h-screen"
      :style="backgroundImageUrl ? `background-image: url(${backgroundImageUrl}); background-size: cover; background-position: center; background-attachment: fixed;` : ''"
  >
    <div class="w-full py-4 mb-6" style="background-color: rgba(0, 0, 0, 0.1);">
      <div class="container mx-auto px-4 flex justify-between items-center">
        <h1 class="text-xl font-bold">{{ board.title }}</h1>
      </div>
    </div>

    <div class="container mx-auto px-4">
      <ListContainer
          v-if="board.lists"
          :board="board"
          :boardId="boardId"
          :lists="board.lists"
          @createCard="openCreateCardModal"
          @editCard="editCard"
          @deleteCard="deleteCard"
          @moveCard="updateCardList"
          @reorderCards="reorderCards"
          @reorderLists="reorderLists"
      />
    </div>

    <!-- Create/Edit Card Modal -->
    <UModal :open="showCreateCardModal">
      <template #body>
        <div class="p-4">
          <h2 class="text-2xl font-bold mb-4">{{ editingCard ? 'Edit Card' : 'Create New Card' }}</h2>
          <form @submit.prevent="editingCard ? updateCard() : createCard()">
            <UInput v-model="newCardTitle" type="text" placeholder="Card Title" class="w-full" />
            <UTextarea v-model="newCardDescription" placeholder="Card Description" class="w-full" />
            <div class="flex justify-end">
              <UButton type="button" @click="showCreateCardModal = false" class="mr-2">Cancel</UButton>
              <UButton type="submit" color="primary">{{ editingCard ? 'Update' : 'Create' }}</UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>
  </div>
  <div v-else class="loading p-4 text-center">
    Loading...
  </div>
</template>