<script setup lang="ts">
import { Card } from '@prisma/client'

interface Props {
  card: Card
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'edit', card: Card): void
  (e: 'delete', cardId: string): void
}>()

const editCard = () => {
  emit('edit', props.card)
}

const deleteCard = () => {
  emit('delete', props.card.id)
}
</script>

<template>
  <div class="bg-white p-3 rounded shadow-sm hover:shadow-md transition-shadow duration-200">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="font-medium text-gray-800">{{ card.title }}</h3>
        <p v-if="card.description" class="text-sm text-gray-600 mt-1">{{ card.description }}</p>
      </div>
      <div class="flex space-x-2">
        <button @click="editCard" class="text-blue-500 hover:text-blue-700 transition-colors duration-200">
          <UIcon name="i-lucide-edit" class="w-4 h-4" />
        </button>
        <button @click="deleteCard" class="text-red-500 hover:text-red-700 transition-colors duration-200">
          <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
        </button>
      </div>
    </div>
    <!-- Add more card details here as needed -->
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