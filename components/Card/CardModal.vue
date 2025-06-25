<script setup lang="ts">
import { ref, watch } from 'vue'
import CardEditor from '~/components/Card/CardEditor.vue'
import { Card } from '@prisma/client'

// Props and Emits
// -----------------------------
interface Props {
  isOpen: boolean
  card: Card | null
}

const props = defineProps<Props>()

const emit = defineEmits(['update:isOpen', 'save', 'delete'])

// State
// -----------------------------
const localCard = ref<Card | null>(null)

// Watchers
// -----------------------------
watch(() => props.card, (newCard) => {
  if (newCard) {
    localCard.value = { ...newCard }
  }
}, { immediate: true })

//=============================================================================
// Modal Management
//=============================================================================

const closeModal = () => {
  emit('update:isOpen', false)
}

//=============================================================================
// Card Operations
//=============================================================================

const saveChanges = () => {
  if (localCard.value) {
    emit('save', localCard.value)
  }
  closeModal()
}

const deleteCard = () => {
  if (localCard.value) {
    emit('delete', localCard.value.id)
  }
  closeModal()
}
</script>

<template>
  <UModal :open="isOpen" @update:open="emit('update:isOpen', $event)" :title="card?.title || 'Card Details'" prevent-close :ui="{ footer: 'justify-end' }">
    <template #body>
      <div v-if="localCard" class="space-y-4">
        <div class="flex items-start space-x-3">
          <UIcon name="i-lucide-edit" class="mt-1 flex-shrink-0" />
          <div class="flex-grow">
            <h4 class="font-medium mb-2">Title</h4>
            <UInput
                v-model="localCard.title"
                placeholder="Card title"
                class="w-full"
            />
          </div>
        </div>
        <div class="flex items-start space-x-3">
          <UIcon name="i-lucide-list" class="mt-1 flex-shrink-0" />
          <div class="flex-grow">
            <h4 class="font-medium mb-2">Description</h4>
            <CardEditor
                v-model="localCard.description"
            />
          </div>
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <UButton color="error" variant="soft" @click="deleteCard">
        Delete
      </UButton>
      <UButton color="neutral" variant="soft" @click="closeModal">
        Close
      </UButton>
      <UButton color="primary" @click="saveChanges">
        Save Changes
      </UButton>
    </template>
  </UModal>
</template>

<style scoped>
:deep(.ql-container) {
  min-height: 200px;
}
</style>