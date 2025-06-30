<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { Card } from '@prisma/client'
import CardItem from './Item.vue'
import CardModal from './CardModal.vue'
import { useCardStore } from '~/stores/cardStore'
import { useListStore } from '~/stores/listStore'

// Props
// -----------------------------
interface Props {
  cards: Card[]
  listId: string
}

const props = defineProps<Props>()

// Stores
// -----------------------------
const cardStore = useCardStore()
const listStore = useListStore()

// State
// -----------------------------
const localCards = ref<Card[]>(props.cards)
const isCardModalOpen = ref(false)
const selectedCard = ref<Card | null>(null)

// Watchers
// -----------------------------
watch(() => props.cards, (newCards) => {
  localCards.value = newCards
}, { deep: true })

//=============================================================================
// Card Management
//=============================================================================

const handleCardChange = async (event: any) => {
  if (event.added) {
    const { element: card, newIndex } = event.added
    await cardStore.moveCard({
      cardId: card.id,
      fromListId: card.listId,
      toListId: props.listId,
      newIndex
    })
  } else if (event.moved) {
    await listStore.reorderCards({
      listId: props.listId,
      cardIds: localCards.value.map(card => card.id)
    })
  }
}

const openCardModal = (card: Card) => {
  selectedCard.value = card
  isCardModalOpen.value = true
}

const editCard = async (card: Card) => {
  await cardStore.editCard(card.id, card)
}

const deleteCard = async (cardId: string) => {
  await cardStore.deleteCard(cardId)
}

//=============================================================================
// Modal Interactions
//=============================================================================

const handleCardSave = async (updatedCard: Card) => {
  await cardStore.editCard(updatedCard.id, updatedCard)
  const index = localCards.value.findIndex(card => card.id === updatedCard.id)
  if (index !== -1) {
    localCards.value[index] = updatedCard
  }
  isCardModalOpen.value = false
}

const handleCardDelete = async (cardId: string) => {
  await cardStore.deleteCard(cardId)
  isCardModalOpen.value = false
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
          @open="openCardModal"
      />
    </template>
  </draggable>

  <CardModal
      v-model:isOpen="isCardModalOpen"
      :card="selectedCard"
      @save="handleCardSave"
      @delete="handleCardDelete"
  />
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