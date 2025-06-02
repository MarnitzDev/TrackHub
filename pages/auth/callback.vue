<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(async () => {
  const { error } = await useSupabaseClient().auth.getSession()
  if (error) {
    console.error('Authentication error:', error)
    // Redirect to login page or show error
    router.push('/auth/login')
  } else {
    // Redirect to a protected page or dashboard
    router.push('/')
  }
})
</script>

<template>
  <div>Processing authentication...</div>
</template>