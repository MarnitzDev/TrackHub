<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import BoardComponent from '~/components/BoardComponent.vue'
import { useAuth } from '~/composables/useAuth'
import { useUserStore } from '~/stores/userStore'

const { user, isAuthenticated, isLoading, checkAuth } = useAuth()
const userStore = useUserStore()

const boardLoading = ref(true)

onMounted(async () => {
  console.log('Board: Component mounted')
  await checkAuth()
  boardLoading.value = false
  console.log('Board: User:', user.value)
  console.log('Board: Is authenticated:', isAuthenticated.value)
})

// Handle board events
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
    <div v-if="boardLoading || isLoading">
      <p>Loading...</p>
    </div>
    <div v-else-if="isAuthenticated">
      <p>Welcome, {{ user?.name || 'User' }}</p>
      <BoardComponent
          @task-added="handleTaskAdded"
          @task-updated="handleTaskUpdated"
          @task-deleted="handleTaskDeleted"
          @column-added="handleColumnAdded"
      />
    </div>
    <div v-else>
      <p>Please log in to view the board.</p>
      <button @click="$router.push('/auth/login')" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Log In
      </button>
    </div>
  </div>
</template>