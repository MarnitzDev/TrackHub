<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'

const supabase = useSupabaseClient()
const connectionStatus = ref('Checking connection...')

onMounted(async () => {
  try {
    // Attempt to query the Supabase database
    const { data, error } = await supabase
        .from('profiles')  // Replace 'profiles' with an actual table in your Supabase database
        .select('*')
        .limit(1)

    if (error) {
      throw error
    }

    connectionStatus.value = 'Connected to Supabase successfully!'
    console.log('Sample data:', data)
  } catch (error) {
    connectionStatus.value = 'Failed to connect to Supabase'
    console.error('Supabase connection error:', error)
  }
})
</script>

<template>
  <div>
    <h1>Supabase Connection Test</h1>
    <p>{{ connectionStatus }}</p>
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