<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'
import { useRouter } from 'vue-router'

const { handleRedirectCallback } = useAuth0()
const router = useRouter()

onMounted(async () => {
  console.log('Current URL:', window.location.href)
  try {
    await handleRedirectCallback()
    router.push('/')
  } catch (error) {
    console.error('Callback error:', error)
  }
})
</script>

<template>
  <div>Processing login...</div>
</template>