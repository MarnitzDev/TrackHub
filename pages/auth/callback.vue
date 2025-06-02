<script setup>
import { onMounted } from 'vue'
import { useRouter } from '#imports'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()
const { loadUser } = useAuth()

onMounted(async () => {
  await loadUser()
  router.push('/')
})
</script>

<template>
  <div>Processing authentication...</div>
</template>