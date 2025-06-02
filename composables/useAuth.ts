import { ref, computed } from 'vue'
import { useSupabaseClient, useRouter } from '#imports'

export const useAuth = () => {
    const supabase = useSupabaseClient()
    const router = useRouter()
    const user = ref(null)
    const loading = ref(false)

    const isAuthenticated = computed(() => !!user.value)

    const loadUser = async () => {
        loading.value = true
        try {
            const { data: { user: loadedUser } } = await supabase.auth.getUser()
            user.value = loadedUser
        } catch (error) {
            console.error('Error loading user:', error)
        } finally {
            loading.value = false
        }
    }

    const signIn = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            })
            if (error) throw error
        } catch (error) {
            console.error('Error signing in:', error)
        }
    }

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
            user.value = null
            router.push('/')
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    return {
        user,
        loading,
        isAuthenticated,
        loadUser,
        signIn,
        signOut
    }
}