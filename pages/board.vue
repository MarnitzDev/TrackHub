<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BoardComponent from '~/components/BoardComponent.vue'

const QuillEditor = ref(null)

// Keep the Quill loading logic here
onMounted(async () => {
  if (process.client) {
    const quillModule = await import('@vueup/vue-quill')
    QuillEditor.value = quillModule.QuillEditor
    await import('@vueup/vue-quill/dist/vue-quill.snow.css')
  }
})

// Handle any board events if necessary
const handleTaskAdded = (task) => {
  console.log('Task added:', task)
  // Handle task added
}

const handleTaskUpdated = (task) => {
  console.log('Task updated:', task)
  // Handle task updated
}

const handleTaskDeleted = (taskId) => {
  console.log('Task deleted:', taskId)
  // Handle task deleted
}

const handleColumnAdded = (column) => {
  console.log('Column added:', column)
  // Handle column added
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Project Board</h1>
    <BoardComponent
        @task-added="handleTaskAdded"
        @task-updated="handleTaskUpdated"
        @task-deleted="handleTaskDeleted"
        @column-added="handleColumnAdded"
    />
  </div>
</template>