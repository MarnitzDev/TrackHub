<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from "~/stores/userStore"

const connectionStatus = ref('Checking connection...')
const userStore = useUserStore()
const isAuthenticated = computed(() => userStore.isAuthenticated)
const userMetadata = computed(() => userStore.userMetadata)

onMounted(async () => {
  try {
    // Fetch connection status from the server
    const { data } = await useFetch('/api/db-status')
    connectionStatus.value = data.value?.status || 'Failed to check connection'
  } catch (error) {
    connectionStatus.value = 'Failed to check connection'
    console.error('Error checking connection:', error)
  }
})
</script>

<template>
  <div>
    <h1>PostgreSQL Connection Test</h1>
    <p>{{ connectionStatus }}</p>
    <p>isAuthenticated: {{isAuthenticated}}</p>
    <p>userMetadata: {{userMetadata}}</p>
  </div>
</template>

<style scoped>
div {
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  color: #333;
}

p {
  margin-top: 20px;
  font-weight: bold;
}
</style>