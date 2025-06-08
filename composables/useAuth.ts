import { computed } from 'vue'
import { useUserStore } from '~/stores/userStore'
import { useRouter } from 'vue-router'
import { pool } from '~/config/database'

export const useAuth = () => {
    const userStore = useUserStore()
    const router = useRouter()

    const user = computed(() => userStore.user)
    const isAuthenticated = computed(() => userStore.isAuthenticated)
    const isUserGuest = computed(() => userStore.isGuest)

    const signInWithGoogle = async () => {
        // Implement OAuth with Google
        // This will require setting up a Google OAuth client and handling the OAuth flow
        console.error('Google Sign-In not implemented')
    }

    const signIn = async (email: string, password: string) => {
        try {
            const result = await pool.query(
                'SELECT * FROM users WHERE email = $1 AND password = $2',
                [email, password] // Note: In a real application, never store plain text passwords
            )

            if (result.rows.length > 0) {
                const user = result.rows[0]
                userStore.setUser(user)
                router.push('/board')
            } else {
                console.error('Invalid credentials')
            }
        } catch (error) {
            console.error('Error signing in:', error)
        }
    }

    const signOut = async () => {
        if (userStore.isGuest) {
            userStore.clearUser()
            router.push('/')
        } else {
            userStore.clearUser()
            router.push('/auth/login')
        }
    }

    const continueAsGuest = () => {
        userStore.setGuest()
        router.push('/board')
    }

    const loadUser = async () => {
        if (userStore.isAuthenticated) {
            try {
                const result = await pool.query(
                    'SELECT * FROM users WHERE id = $1',
                    [userStore.user.id]
                )

                if (result.rows.length > 0) {
                    userStore.setUser(result.rows[0])
                } else {
                    userStore.clearUser()
                }
            } catch (error) {
                console.error('Error loading user:', error)
                userStore.clearUser()
            }
        }
    }

    return {
        user,
        isAuthenticated,
        isUserGuest,
        signInWithGoogle,
        signIn,
        signOut,
        continueAsGuest,
        loadUser
    }
}