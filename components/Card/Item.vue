
<script setup lang="ts">
import { Card } from '@prisma/client'

interface Props {
  card: Card
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'open', card: Card): void
}>()

const openCard = () => {
  emit('open', props.card)
}
</script>

<template>
  <div @click="openCard" class="bg-white p-3 rounded shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="font-medium text-gray-800">{{ card.title }}</h3>
        <p v-if="card.description" class="text-sm text-gray-600 mt-1">{{ card.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-item {
  cursor: grab;
}

.card-item:active {
  cursor: grabbing;
}
</style>