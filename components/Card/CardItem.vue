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
  <div class="bg-white p-2 rounded shadow">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="font-medium">{{ card.title }}</h3>
        <p class="text-sm text-gray-600">{{ card.description }}</p>
      </div>
      <div class="flex space-x-2">
        <button @click="editCard" class="text-blue-500 hover:text-blue-700">
          <UIcon name="i-lucide-edit" class="w-4 h-4" />
        </button>
        <button @click="deleteCard" class="text-red-500 hover:text-red-700">
          <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>