
import { useAuth0 } from '@auth0/auth0-vue'
import { useUserStore } from '~/stores/userStore'
import { computed, ref } from 'vue'

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

    return {
        user: auth0.user,
        isAuthenticated: auth0.isAuthenticated,
        isUserGuest: computed(() => isUserGuest.value),
        signInWithAuth0,
        signOut,
        continueAsGuest,
        loadUser
    }
}