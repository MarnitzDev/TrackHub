<script setup lang="ts">
import { ref, watch } from 'vue'
import { Board, List, Card } from '@prisma/client'
import ListContainer from '~/components/List/Container.vue'

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

const createCard = async () => {
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
  editingCard.value = card
  newCardTitle.value = card.title
  newCardDescription.value = card.description || ''
  activeListId.value = card.listId
  showCreateCardModal.value = true
}

const updateCard = async () => {
  if (!editingCard.value) return

  await $fetch(`/api/cards/${editingCard.value.id}`, {
    method: 'PUT',
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
  editingCard.value = null
  activeListId.value = null
}

const deleteCard = async (cardId: string) => {
  try {
    await $fetch(`/api/cards/${cardId}`, {
      method: 'DELETE'
    })
    await refresh()
  } catch (error) {
    console.error('Error deleting card:', error)
  }
}

const updateCardList = async (cardId: string, newListId: string, newIndex: number) => {
  try {
    const response = await $fetch(`/api/cards/${cardId}`, {
      method: 'PUT',
      body: {
        listId: newListId,
        order: newIndex
      }
    })

    if (!response) {
      throw new Error('Failed to update card')
    }

    await refresh()
  } catch (error) {
    console.error('Error updating card list:', error)
    useToast().add({
      title: 'Error',
      description: 'Failed to update card position. Please try again.',
      color: 'red'
    })
    await refresh()
  }
}

const reorderCards = async (listId: string, cardIds: string[]) => {
  try {
    const response = await $fetch(`/api/lists/${listId}/reorder`, {
      method: 'PUT',
      body: { cardIds }
    })

    if (!response) {
      throw new Error('Failed to reorder cards')
    }

    // Update the local state to reflect the new order
    if (board.value) {
      const listIndex = board.value.lists.findIndex(list => list.id === listId)
      if (listIndex !== -1) {
        board.value.lists[listIndex].cards = cardIds.map((cardId, index) => {
          const card = board.value!.lists[listIndex].cards.find(c => c.id === cardId)
          return card ? { ...card, order: index } : null
        }).filter((card): card is Card => card !== null)
      }
    }

    // No need to call refresh() here as we've updated the local state
  } catch (error) {
    console.error('Error reordering cards:', error)
    useToast().add({
      title: 'Error',
      description: 'Failed to reorder cards. Please try again.',
      color: 'red'
    })
    await refresh() // Refresh only on error to revert to the previous state
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