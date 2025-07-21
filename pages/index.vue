<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import BoardContainer from '~/components/Board/Container.vue'

const { status, signIn, getSession } = useAuth()
const isLoading = ref(true)
const session = ref(null)

onMounted(async () => {
  try {
    const sessionData = await getSession()
    if (typeof sessionData === 'object' && sessionData !== null) {
      session.value = sessionData
    } else {
      console.error('Invalid session data:', sessionData)
      session.value = null
    }
  } catch (error) {
    console.error('Error fetching session:', error)
    session.value = null
  } finally {
    isLoading.value = false
  }
  console.log('Mounted - Session:', session.value, 'isLoading:', isLoading.value)
})

watch(status, async (newStatus) => {
  console.log('Auth status changed:', newStatus)
  if (newStatus === 'authenticated') {
    session.value = await getSession()
  } else {
    session.value = null
  }
  console.log('After status change - Session:', session.value)
})

const handleLogin = () => {
  console.log('Login button clicked')
  signIn('google')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
      <div v-if="status === 'loading'" class="text-center">
        <p class="text-lg">Loading...</p>
      </div>
      <div v-else-if="status === 'authenticated'" class="w-full">
        <BoardContainer />
      </div>
      <div v-else class="text-center">
        <h2 class="text-3xl font-bold mb-6">Welcome to TrackHub</h2>
        <p class="text-lg mb-8">Please log in to view and manage your boards.</p>
        <button
            @click="handleLogin"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
            data-testid="login-button"
        >
          Log In with Google
        </button>
        <p class="mt-4 text-sm text-gray-600">
          Debug: status: {{ status }}
        </p>
      </div>
    </div>
  </div>
</template>