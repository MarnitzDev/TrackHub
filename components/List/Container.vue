<script setup lang="ts">
import { ref, watch, computed } from 'vue'
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

const emit = defineEmits(['createCard', 'editCard', 'deleteCard', 'updateCardList', 'reorderCards'])

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

const handleCardChange = (event: any, listId: string) => {
  if (event.added) {
    const { element: card, newIndex } = event.added
    emit('updateCardList', { cardId: card.id, newListId: listId, newIndex, oldListId: card.listId })
  } else if (event.moved) {
    const { oldIndex, newIndex } = event.moved
    const updatedList = localLists.value.find(list => list.id === listId)
    if (updatedList) {
      const cardIds = updatedList.cards.map(card => card.id)
      const [movedCardId] = cardIds.splice(oldIndex, 1)
      cardIds.splice(newIndex, 0, movedCardId)
      emit('reorderCards', { listId, cardIds })
    }
  }
}

const lists = computed(() => localLists.value.map(list => ({
  ...list,
  cards: list.cards.sort((a, b) => a.order - b.order)
})))

</script>

<template>
  <div class="flex space-x-4 overflow-x-auto">
    <div v-for="list in lists" :key="list.id" class="bg-gray-100 p-4 rounded min-w-[250px]">
      <h2 class="text-xl font-semibold mb-2">{{ list.title }}</h2>
      <draggable
          :list="list.cards"
          group="cards"
          item-key="id"
          class="space-y-2"
          :force-fallback="true"
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

<style scoped>
.ghost-card {
  background-color: #e5e7eb;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  opacity: 0.5;
}

.dragging-card {
  transform: rotate(2deg);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  cursor: grabbing;
}
</style>