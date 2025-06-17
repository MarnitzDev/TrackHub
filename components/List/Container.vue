<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
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
  (e: 'updateCardList', cardId: string, newListId: string, newIndex: number): void
  (e: 'reorderCards', listId: string, cardIds: string[]): void
}>()

const localLists = ref<ListWithCards[]>([...props.lists])

watch(() => props.lists, (newLists) => {
  localLists.value = [...newLists]
}, { deep: true })

const openCreateCardModal = (listId: string) => {
  emit('createCard', listId)
}

const editCard = (card: Card) => {
  emit('editCard', card)
}

const deleteCard = (cardId: string) => {
  emit('deleteCard', cardId)
}

const handleCardChange = async (e: any, listId: string) => {
  console.log("handleCardChange: ", e, "listId: ", listId)
  if (e.added) {
    const { element: card, newIndex } = e.added
    emit('updateCardList', card.id, listId, newIndex)
  } else if (e.moved) {
    const updatedCardIds = localLists.value
        .find(list => list.id === listId)
        ?.cards.map(card => card.id) || []
    emit('reorderCards', listId, updatedCardIds)
  }
}

</script>

<template>
  <div class="flex space-x-4 overflow-x-auto">
    <div v-for="list in localLists" :key="list.id" class="bg-gray-100 p-4 rounded min-w-[250px]">
      <h2 class="text-xl font-semibold mb-2">{{ list.title }}</h2>
      <draggable
          :list="list.cards"
          group="cards"
          item-key="id"
          class="space-y-2"
          ghost-class="ghost-card"
          drag-class="dragging-card"
          @change="(e) => handleCardChange(e, list.id)"
      >
        <template #item="{ element: card }">
          <CardItem
              :card="card"
              @edit="editCard"
              @delete="deleteCard"
          />
        </template>
      </draggable>
      <button @click="openCreateCardModal(list.id)" class="w-full text-left p-2 text-gray-600 hover:bg-gray-200 rounded mt-2">
        + Add a card
      </button>
    </div>
  </div>
</template>

<!--<style scoped>-->
<!--.ghost-card {-->
<!--  @apply bg-gray-200 border border-gray-300 rounded-lg;-->
<!--}-->
<!--.ghost-card > div {-->
<!--  @apply invisible;-->
<!--}-->

<!--.dragging-card {-->
<!--  @apply transform rotate-2 shadow-xl cursor-grabbing;-->
<!--}-->
<!--</style>-->