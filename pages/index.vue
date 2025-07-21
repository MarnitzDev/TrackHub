<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BoardContainer from '~/components/Board/Container.vue'

const { status, signIn } = useAuth()
const isLoading = ref(true)

onMounted(() => {
  // Set isLoading to false after a short delay to allow auth status to resolve
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})

const handleLogin = () => {
  signIn('google', { callbackUrl: '/' })
}
</script>

<template>
  <div :class="{
    'flex items-center justify-center min-h-screen bg-gray-100': status !== 'authenticated',
    'bg-gray-100': status === 'authenticated'
  }">
    <div :class="{
      'w-full max-w-md p-8 bg-white rounded-lg shadow-md': status !== 'authenticated',
      'w-full': status === 'authenticated'
    }">
      <div v-if="isLoading" class="text-center">
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
        >
          Log In with Google
        </button>
      </div>
    </div>
  </div>
</template>