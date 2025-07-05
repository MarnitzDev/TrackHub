<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { Card } from '@prisma/client'
import CardItem from './Item.vue'
import CardEditor from './CardEditor.vue'
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

const openCardEditor = (card: Card) => {
  cardStore.openCard(card)
}

const handleEditCard = async (cardId: string, updatedData: Partial<Card>) => {
  await cardStore.editCard(cardId, updatedData)
}

const handleDeleteCard = async (cardId: string) => {
  await cardStore.deleteCard(cardId, props.listId)
}
</script>

<template>
  <div class="relative">
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
            @click="openCardEditor(card)"
            @edit="handleEditCard"
            @delete="handleDeleteCard"
        />
      </template>
    </draggable>

    <CardEditor
        @save="handleEditCard"
        @delete="handleDeleteCard"
    />
  </div>
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