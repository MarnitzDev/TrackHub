
import { useUserStore } from '~/stores/userStore'
import { useAuth0 } from '@auth0/auth0-vue'
import { computed, ref, watch, onMounted } from 'vue'

export const useAuth = () => {
    const auth0 = useAuth0()
    const userStore = useUserStore()

    const isUserGuest = ref(false)
    const isLoading = ref(true)

    const isAuthenticated = computed(() => {
        return userStore.isAuthenticated || isUserGuest.value
    })

    const user = computed(() => {
        return userStore.user || auth0.user.value
    })

    watch(auth0.isAuthenticated, (newValue) => {
        console.log('Auth0 isAuthenticated changed:', newValue)
        if (newValue) {
            loadUser()
        }
    })

    const signInWithAuth0 = () => {
        console.log('Initiating Auth0 login')
        auth0.loginWithRedirect()
    }

    const signOut = async () => {
        console.log('Signing out')
        if (isUserGuest.value) {
            userStore.clearUser()
            isUserGuest.value = false
        } else {
            await auth0.logout({ logoutParams: { returnTo: window.location.origin } })
            userStore.clearUser()
        }
    }

    const continueAsGuest = () => {
        console.log('Continuing as guest')
        userStore.setGuest()
        isUserGuest.value = true
    }

    const saveUserToDatabase = async (auth0User) => {
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: auth0User.email,
                    name: auth0User.name,
                    auth0Id: auth0User.sub,
                }),
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Failed to save user to database: ${errorText}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error saving user to database:', error)
            throw error
        }
    }

    const loadUser = async () => {
        console.log('Loading user')
        if (auth0.isAuthenticated.value && auth0.user.value) {
            try {
                const savedUser = await saveUserToDatabase(auth0.user.value)
                console.log('Setting user in store:', savedUser)
                userStore.setUser(savedUser)
            } catch (error) {
                console.error('Error loading user:', error)
                // Handle error (e.g., show an error message to the user)
            }
        } else {
            console.log('No authenticated user to load')
        }
    }

    const getAccessToken = async () => {
        try {
            console.log('Getting access token')
            const token = await auth0.getAccessTokenSilently()
            console.log('Access token retrieved')
            return token
        } catch (error) {
            console.error('Error getting access token:', error)
            return null
        }
    }

    const checkAuth = async () => {
        isLoading.value = true
        try {
            console.log('Checking authentication')
            await auth0.checkSession()
            if (auth0.isAuthenticated.value) {
                console.log('User is authenticated, loading user')
                await loadUser()
            } else {
                console.log('User is not authenticated')
                userStore.clearUser()
            }
        } catch (error) {
            console.error('Error checking authentication:', error)
            userStore.clearUser()
        } finally {
            isLoading.value = false
        }
    }

    onMounted(() => {
        checkAuth()
    })

    return {
        isAuthenticated,
        isUserGuest: computed(() => isUserGuest.value),
        user,
        isLoading,
        signInWithAuth0,
        signOut,
        continueAsGuest,
        loadUser,
        getAccessToken,
        checkAuth,
        saveUserToDatabase
    }
}