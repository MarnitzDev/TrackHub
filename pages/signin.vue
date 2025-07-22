<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '#imports'
import { useRoute, useRouter } from 'vue-router'

const { signIn, status } = useAuth()
const route = useRoute()
const router = useRouter()

const isLoading = ref(false)
const error = ref('')

const handleSignIn = async () => {
  isLoading.value = true
  error.value = ''
  try {
    await signIn('google', { callbackUrl: route.query.callbackUrl as string || '/' })
  } catch (e) {
    console.error('Sign in error:', e)
    error.value = 'An error occurred during sign in. Please try again.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (status.value === 'authenticated') {
    router.push(route.query.callbackUrl as string || '/')
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
      <h2 class="text-3xl font-bold mb-6 text-center">Sign In to TrackHub</h2>
      <p v-if="error" class="text-red-500 mb-4 text-center">{{ error }}</p>
      <button
          @click="handleSignIn"
          :disabled="isLoading"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center"
      >
        <span v-if="isLoading" class="mr-2">
          <UIcon name="i-lucide-loader-2" class="animate-spin" />
        </span>
        {{ isLoading ? 'Signing In...' : 'Sign In with Google' }}
      </button>
    </div>
  </div>
</template>