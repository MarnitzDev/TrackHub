import { ref, computed } from 'vue'
import { useSupabaseClient, useRouter } from '#imports'
import { useUserStore } from '~/stores/userStore'

export const useAuth = () => {
    const supabase = useSupabaseClient()
    const router = useRouter()
    const userStore = useUserStore()
    const loading = ref(false)

    const user = computed(() => userStore.user)
    const isAuthenticated = computed(() => userStore.isAuthenticated)

    const loadUser = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            console.log('Loaded user:', user);
            userStore.setUser(user)
        } catch (error) {
            console.error('Error loading user:', error)
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
            userStore.clearUser()
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