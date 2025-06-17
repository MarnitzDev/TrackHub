<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { Card } from '@prisma/client'
import CardItem from './Item.vue'

interface Props {
  cards: Card[]
  listId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'reorderCards', payload: { listId: string, cardIds: string[] }): void
  (e: 'moveCard', payload: { cardId: string, fromListId: string, toListId: string, newIndex: number }): void
  (e: 'editCard', card: Card): void
  (e: 'deleteCard', cardId: string): void
}>()

const localCards = ref<Card[]>(props.cards)

watch(() => props.cards, (newCards) => {
  localCards.value = newCards
}, { deep: true })

const handleCardChange = (event: any) => {
  if (event.added) {
    const { element: card, newIndex } = event.added
    emit('moveCard', {
      cardId: card.id,
      fromListId: card.listId,
      toListId: props.listId,
      newIndex
    })
  } else if (event.moved) {
    emit('reorderCards', {
      listId: props.listId,
      cardIds: localCards.value.map(card => card.id)
    })
  }
}

const editCard = (card: Card) => {
  emit('editCard', card)
}

const deleteCard = (cardId: string) => {
  emit('deleteCard', cardId)
}
</script>

<template>
  <draggable
      v-model="localCards"
      group="cards"
      item-key="id"
      class="space-y-2"
      ghost-class="ghost-card"
      drag-class="dragging-card"
      @change="handleCardChange"
  >
    <template #item="{ element: card }">
      <CardItem
          :card="card"
          @edit="editCard"
          @delete="deleteCard"
      />
    </template>
  </draggable>
</template>

<style scoped>
.ghost-card {
  opacity: 0.5;
  background: #c8ebfb;
}

.dragging-card {
  transform: rotate(2deg);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>