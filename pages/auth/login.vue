<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
    <div class="w-full max-w-md px-8 py-10 bg-white shadow-2xl rounded-lg">
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-2">Welcome to TrackHub</h1>
      <p class="text-center text-gray-600 mb-8">Streamline your workflow and boost productivity with our intuitive project management tool.</p>

      <div class="space-y-6">
        <button
            @click="handleSignIn"
            class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" class="w-5 h-5 mr-2" />
          <span>Sign in with Google</span>
        </button>
        <p v-if="error" class="text-red-500 text-center mt-2">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '#imports'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const { signIn } = useAuth()
const router = useRouter()
const error = ref('')

const handleSignIn = async () => {
  try {
    error.value = ''
    await signIn('google', { callbackUrl: '/' })
    // The user will be redirected to Google for authentication,
    // and then back to the callbackUrl (home page) upon success.
  } catch (err) {
    console.error('Sign in error:', err)
    error.value = 'An error occurred during sign in. Please try again.'
  }
}
</script>