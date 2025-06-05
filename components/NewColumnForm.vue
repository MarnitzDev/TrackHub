<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['addColumn', 'cancel'])

const newColumnTitle = ref('')

const saveNewColumn = () => {
  if (newColumnTitle.value.trim()) {
    emit('addColumn', { title: newColumnTitle.value.trim() })
    newColumnTitle.value = ''
  }
}

const cancelNewColumn = () => {
  newColumnTitle.value = ''
  emit('cancel')
}
</script>

<template>
  <div class="bg-gray-100 p-4 rounded-lg w-64 flex-shrink-0">
    <UInput
        v-model="newColumnTitle"
        variant="none"
        placeholder="Enter column title"
        class="w-full mb-2"
    />
    <div class="flex space-x-2 mt-2">
      <UButton color="primary" @click="saveNewColumn">Add Column</UButton>
      <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="soft"
          @click="cancelNewColumn"
      />
    </div>
  </div>
</template>