<script setup lang="ts">
import { ref, computed } from 'vue'
import { Board, List, Card } from '@prisma/client'
import ListContainer from '~/components/List/Container.vue'
import { useBoardStore } from '~/stores/boardStore'
import { useListStore } from '~/stores/listStore'
// import { useToast } from '@nuxt/ui'

// Stores
// -----------------------------
const boardStore = useBoardStore()
const listStore = useListStore()

// Types
// -----------------------------
interface ListWithCards extends List {
  cards: Card[]
}

interface BoardWithLists extends Board {
  lists: ListWithCards[]
}

// Route and Data Fetching
// -----------------------------
const route = useRoute()
const boardId = route.params.id as string

const { data: board, refresh } = await useFetch<BoardWithLists>(`/api/boards/${boardId}`)

// State
// -----------------------------
const showCreateListModal = ref(false)
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

//=============================================================================
// List Management
//=============================================================================

const createList = async () => {
  const newListOrder = board.value?.lists.length || 0
  try {
    const newList = await $fetch(`/api/lists`, {
      method: 'POST',
      body: {
        title: newListTitle.value,
        boardId,
        order: newListOrder
      }
    })

    // Add the new list to the current board in the store
    boardStore.addListToCurrentBoard(newList)

    // Optionally, you can also update the listStore
    await listStore.fetchLists(boardId)

    // Update the local board data
    if (board.value) {
      if (!Array.isArray(board.value.lists)) {
        board.value.lists = []
      }
      board.value.lists.push(newList)
    }

    showCreateListModal.value = false
    newListTitle.value = ''
  } catch (error) {
    console.error('Error creating list:', error)
    // Handle error (e.g., show error message to user)
  }
}

const reorderLists = async (newOrder: string[]) => {
  console.log('Reordering lists:', newOrder);
  try {
    await $fetch(`/api/boards/${boardId}/reorder-lists`, {
      method: 'PUT',
      body: { listIds: newOrder }
    });
    console.log('Lists reordered successfully');
    await refresh();
  } catch (error) {
    console.error('Error reordering lists:', error);
    // Handle error (e.g., show toast notification)
  }
}

//=============================================================================
// Card Management
//=============================================================================

const openCreateCardModal = (listId: string) => {
  activeListId.value = listId
  editingCard.value = null
  newCardTitle.value = ''
  newCardDescription.value = ''
  showCreateCardModal.value = true
}

const updateCardList = async ({ cardId, fromListId, toListId, newIndex }) => {
  console.log("updateCardList", { cardId, fromListId, toListId, newIndex });
  if (!board.value) return

  // Optimistic update
  const oldList = board.value.lists.find(list => list.id === fromListId)
  const newList = board.value.lists.find(list => list.id === toListId)
  const card = oldList?.cards.find(c => c.id === cardId)

  if (oldList && newList && card) {
    // Remove card from old list
    oldList.cards = oldList.cards.filter(c => c.id !== cardId)

    // Add card to new list
    const updatedCard = { ...card, listId: toListId, order: newIndex }
    newList.cards.splice(newIndex, 0, updatedCard)

    // Update order of cards in both old and new lists
    oldList.cards.forEach((c, index) => {
      c.order = index
    })
    newList.cards.forEach((c, index) => {
      c.order = index
    })
  }

  try {
    // Update the card on the server
    const updatedCard = await $fetch(`/api/cards/${cardId}`, {
      method: 'PUT',
      body: {
        listId: toListId,
        order: newIndex
      }
    })
    console.log("Card updated successfully", updatedCard);

    // Reorder cards in the new list
    const updatedCardIds = newList?.cards.map(c => c.id) || []
    await $fetch(`/api/lists/${toListId}/reorder`, {
      method: 'PUT',
      body: { cardIds: updatedCardIds }
    })
    console.log("List reordered successfully");

    // Refresh the board data to ensure consistency
    await refresh()

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

const editCard = (card: Card) => {
  editingCard.value = card
  newCardTitle.value = card.title
  newCardDescription.value = card.description || ''
  activeListId.value = card.listId
  showCreateCardModal.value = true
}

const deleteCard = async (cardId: string) => {
  if (!board.value) return

  // Optimistic update
  const list = board.value.lists.find(l => l.cards.some(c => c.id === cardId))
  if (list) {
    list.cards = list.cards.filter(c => c.id !== cardId)
  }

  try {
    await $fetch(`/api/cards/${cardId}`, {
      method: 'DELETE'
    })
  } catch (error) {
    console.error('Error deleting card:', error)
    // useToast().add({
    //   title: 'Error',
    //   description: 'Failed to delete card. Changes will be reverted.',
    //   color: 'red'
    // })
    await refresh()
  }
}

const createCard = async () => {
  if (!activeListId.value) return

  const newCard = {
    title: newCardTitle.value,
    description: newCardDescription.value,
    listId: activeListId.value,
    order: board.value?.lists.find(l => l.id === activeListId.value)?.cards.length || 0
  }

  // Optimistic update
  const list = board.value?.lists.find(l => l.id === activeListId.value)
  if (list) {
    list.cards.push({ ...newCard, id: 'temp-id-' + Date.now() } as Card)
  }

  try {
    const createdCard = await $fetch('/api/cards', {
      method: 'POST',
      body: newCard
    })

    // Update the temporary card with the real one
    if (list) {
      const index = list.cards.findIndex(c => c.id === 'temp-id-' + Date.now())
      if (index !== -1) {
        list.cards[index] = createdCard
      }
    }
  } catch (error) {
    console.error('Error creating card:', error)
    // useToast().add({
    //   title: 'Error',
    //   description: 'Failed to create card. Changes will be reverted.',
    //   color: 'red'
    // })
    await refresh()
  }

  showCreateCardModal.value = false
  newCardTitle.value = ''
  newCardDescription.value = ''
  activeListId.value = null
}

const updateCard = async () => {
  if (!editingCard.value) return

  const updatedCard = {
    ...editingCard.value,
    title: newCardTitle.value,
    description: newCardDescription.value
  }

  // Optimistic update
  const list = board.value?.lists.find(l => l.id === editingCard.value?.listId)
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
    // useToast().add({
    //   title: 'Error',
    //   description: 'Failed to update card. Changes will be reverted.',
    //   color: 'red'
    // })
    await refresh()
  }

  showCreateCardModal.value = false
  editingCard.value = null
  newCardTitle.value = ''
  newCardDescription.value = ''
}
</script>

<template>
  <div
      v-if="board"
      class="min-h-screen"
      :style="backgroundImageUrl ? `background-image: url(${backgroundImageUrl}); background-size: cover; background-position: center; background-attachment: fixed;` : ''"
  >
    <div class="w-full py-4 mb-6" style="background-color: rgba(255, 255, 255, 0.2);">
      <div class="container mx-auto px-4">
        <h1 class="text-xl font-bold text-white">{{ board.title }}</h1>
      </div>
    </div>

    <div class="container mx-auto px-4">
      <ListContainer
          v-if="board.lists"
          :board="board"
          :boardId="$route.params.id"
          :lists="board.lists"
          @createCard="openCreateCardModal"
          @editCard="editCard"
          @deleteCard="deleteCard"
          @moveCard="updateCardList"
          @reorderCards="reorderCards"
          @reorderLists="reorderLists"
      />

      <button @click="showCreateListModal = true" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Add New List
      </button>
    </div>

    <!-- Create List Modal -->
    <UModal :open="showCreateListModal">
      <template #content>
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