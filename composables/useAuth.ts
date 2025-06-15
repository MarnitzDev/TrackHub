import { computed, ref, watch } from 'vue'
import { useUserStore } from '~/stores/userStore'
import { useAuth0 } from '@auth0/auth0-vue'

export const useAuth = () => {
    const auth0 = useAuth0()
    const userStore = useUserStore()

    const isUserGuest = ref(false)

    const signInWithAuth0 = () => {
        auth0.loginWithRedirect()
    }

    const signOut = async () => {
        if (isUserGuest.value) {
            userStore.clearUser()
            isUserGuest.value = false
        } else {
            await auth0.logout({ logoutParams: { returnTo: window.location.origin } })
            userStore.clearUser()
        }
    }

    const continueAsGuest = () => {
        userStore.setGuest()
        isUserGuest.value = true
    }

    const loadUser = async () => {
        if (auth0.isAuthenticated.value && auth0.user.value) {
            userStore.setUser(auth0.user.value)
        }
    }

    // Use watch to react to authentication state changes
    watch(() => auth0.isAuthenticated.value, (isAuthenticated) => {
        if (isAuthenticated && auth0.user.value) {
            userStore.setUser(auth0.user.value)
        } else {
            userStore.clearUser()
        }
    }, { immediate: true })

    return {
        user: computed(() => auth0.user.value),
        isAuthenticated: computed(() => auth0.isAuthenticated.value),
        isUserGuest: computed(() => isUserGuest.value),
        signInWithAuth0,
        signOut,
        continueAsGuest,
        loadUser
    }
}