<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '~/stores/userStore'
import { pool } from '~/config/database'

const connectionStatus = ref('Checking connection...')
const userStore = useUserStore()
const isAuthenticated = computed(() => userStore.isAuthenticated)
const userMetadata = computed(() => userStore.userMetadata)

onMounted(async () => {
  try {
    // Attempt to query the PostgreSQL database
    const result = await pool.query('SELECT * FROM profiles LIMIT 1')

    connectionStatus.value = 'Connected to PostgreSQL successfully!'
    console.log('Sample data:', result.rows)
  } catch (error) {
    connectionStatus.value = 'Failed to connect to PostgreSQL'
    console.error('PostgreSQL connection error:', error)
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