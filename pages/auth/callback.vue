<script setup>
import { useAuth0 } from '@auth0/auth0-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/userStore'

const { handleRedirectCallback } = useAuth0()
const router = useRouter()
const userStore = useUserStore()

onMounted(async () => {
  try {
    await handleRedirectCallback()
    userStore.setAuthenticated(true)  // Set authenticated state
    router.push('/board')  // Redirect to board after successful login
  } catch (e) {
    console.error('Callback error:', e)
    router.push('/auth/login')
  }
})
</script>