<script setup lang="ts">
import { List, Card } from '@prisma/client'
import CardItem from '~/components/List/Item.vue'

interface ListWithCards extends List {
  cards: Card[]
}

interface Props {
  lists: ListWithCards[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'createCard', listId: string): void
  (e: 'editCard', card: Card): void
  (e: 'deleteCard', cardId: string): void
}>()

const openCreateCardModal = (listId: string) => {
  emit('createCard', listId)
}

const editCard = (card: Card) => {
  emit('editCard', card)
}

const deleteCard = (cardId: string) => {
  emit('deleteCard', cardId)
}
</script>

<template>
  <div class="flex space-x-4 overflow-x-auto">
    <div v-for="list in lists" :key="list.id" class="bg-gray-100 p-4 rounded min-w-[250px]">
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
</template>