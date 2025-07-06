<script setup lang="ts">
import { Card } from '@prisma/client'
import { useCardStore } from '~/stores/cardStore'

// Props
// -----------------------------
interface Props {
  card: Card
}

const props = defineProps<Props>()

// Store
// -----------------------------
const cardStore = useCardStore()

//=============================================================================
// Card Interactions
//=============================================================================

const openCard = () => {
  cardStore.openCard(props.card)
}

// Function to truncate HTML content
const truncateHTML = (html: string, maxLength: number) => {
  const div = document.createElement('div')
  div.innerHTML = html
  const text = div.textContent || div.innerText || ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : html
}
</script>

<template>
  <div @click="openCard" class="card-item bg-white p-3 rounded">
    <div class="flex flex-col">
      <h3 class="font-medium text-gray-800 truncate">{{ card.title }}</h3>
      <div v-if="card.description" class="text-sm text-gray-600 mt-1 description-preview" v-html="truncateHTML(card.description, 100)"></div>
    </div>
  </div>
</template>

<style scoped>
.card-item {
  cursor: grab;
  overflow: hidden;
  border: 1px solid transparent;
}

.card-item:active {
  cursor: grabbing;
}

.card-item:hover {
  cursor: pointer;
  border: 1px solid #849ee8;
}

.description-preview {
  max-height: 3em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>