<script setup>
import { useAuth } from '#imports'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/userStore'

const { status, getSession } = useAuth()
const router = useRouter()
const userStore = useUserStore()

onMounted(async () => {
  try {
    await until(() => status.value !== 'loading')

    if (status.value === 'authenticated') {
      const session = await getSession()
      if (session) {
        userStore.setUser(session.user)
        await router.push('/board')
      } else {
        throw new Error('Session is null')
      }
    } else {
      throw new Error('Authentication failed')
    }
  } catch (e) {
    console.error('Callback error:', e)
    await router.push('/auth/login')
  }
})
</script>

<template>
  <div>Processing authentication...</div>
</template>