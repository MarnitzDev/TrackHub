<script setup lang="ts">
import { ref, watch } from 'vue'
import TaskEditor from '~/components/TaskEditor.vue'

interface Task {
  id: number
  title: string
  description: string
  status: string
}

const props = defineProps<{
  isOpen: boolean
  task: Task | null
  columnId: number | null
}>()

const emit = defineEmits(['update:isOpen', 'save', 'delete'])

const localTask = ref<Task | null>(null)

watch(() => props.task, (newTask) => {
  if (newTask) {
    localTask.value = { ...newTask }
  }
}, { immediate: true })

const closeModal = () => {
  emit('update:isOpen', false)
}

const saveChanges = () => {
  if (localTask.value) {
    emit('save', localTask.value)
  }
  closeModal()
}

const deleteTask = () => {
  if (localTask.value) {
    emit('delete', localTask.value.id)
  }
  closeModal()
}
</script>

<template>
  <UModal :open="isOpen" @update:open="emit('update:isOpen', $event)" :title="task?.title || 'Task Details'" prevent-close :ui="{ footer: 'justify-end' }">
    <template #body>
      <div v-if="localTask" class="space-y-4">
        <div class="flex items-start space-x-3">
          <UIcon name="i-lucide-edit" class="mt-1 flex-shrink-0" />
          <div class="flex-grow">
            <h4 class="font-medium mb-2">Title</h4>
            <UInput
                v-model="localTask.title"
                placeholder="Task title"
                class="w-full"
            />
          </div>
        </div>
        <div class="flex items-start space-x-3">
          <UIcon name="i-lucide-list" class="mt-1 flex-shrink-0" />
          <div class="flex-grow">
            <h4 class="font-medium mb-2">Description</h4>
            <TaskEditor
                v-model="localTask.description"
            />
          </div>
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <UButton color="error" variant="soft" @click="deleteTask">
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