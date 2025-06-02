<script setup lang="ts">
import { useAuth } from '#imports'
import { useRouter } from 'vue-router'

const { signIn, status } = useAuth()
const router = useRouter()

const handleGoogleSignIn = () => {
  signIn('google')
}

const continueAsGuest = () => {
  // Set a flag in localStorage to indicate guest mode
  localStorage.setItem('guestMode', 'true')
  router.push('/board')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen py-2">
    <h1 class="text-4xl font-bold mb-8">Welcome to TrackHub</h1>
    <div class="space-y-4">
      <UButton
          @click="handleGoogleSignIn"
          color="primary"
          class="w-full"
      >
        Sign in with Google
      </UButton>
      <UButton
          @click="continueAsGuest"
          color="gray"
          class="w-full"
      >
        Continue as Guest
      </UButton>
    </div>
    <p class="mt-4 text-sm text-gray-600">
      Sign in to save your progress and access all features.
    </p>
  </div>
</template>