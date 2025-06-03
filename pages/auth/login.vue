<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const { signInWithGoogle, continueAsGuest } = useAuth()

const handleGoogleSignIn = () => {
  signInWithGoogle()
}

const handleContinueAsGuest = () => {
  continueAsGuest()
}
</script>

<template>
  <div class="login-container">
    <h1 class="text-2xl font-bold mb-6">Welcome to TrackHub</h1>
    <div class="space-y-4">
      <UButton
          block
          color="primary"
          @click="handleGoogleSignIn"
      >
        <UIcon name="i-logos-google-icon" class="mr-2" />
        Sign in with Google
      </UButton>
      <UButton
          block
          color="neutral"
          variant="soft"
          @click="handleContinueAsGuest"
      >
        Continue as Guest
      </UButton>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 100px auto;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>