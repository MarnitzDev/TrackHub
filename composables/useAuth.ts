import { computed } from 'vue'
import { useUserStore } from '~/stores/userStore'
import { useRouter } from 'vue-router'
import { useSupabaseClient } from '#imports'

export const useAuth = () => {
    const userStore = useUserStore()
    const router = useRouter()
    const supabase = useSupabaseClient()

    const user = computed(() => userStore.user)
    const isAuthenticated = computed(() => userStore.isAuthenticated)
    const isUserGuest = computed(() => userStore.isGuest)

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        })
        if (error) console.error('Error signing in with Google:', error)
    }

    const signOut = async () => {
        if (userStore.isGuest) {
            userStore.clearUser()
            router.push('/')
        } else {
            const { error } = await supabase.auth.signOut()
            if (error) {
                console.error('Error signing out:', error)
            } else {
                userStore.clearUser()
                router.push('/auth/login')
            }
        }
    }

    const continueAsGuest = () => {
        userStore.setGuest()
        router.push('/board')
    }

    const loadUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            userStore.setUser(user)
        }
    }

    return {
        user,
        isAuthenticated,
        isUserGuest,
        signInWithGoogle,
        signOut,
        continueAsGuest,
        loadUser
    }
}