import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { createAuth0 } from '@auth0/auth0-vue'
import { watch } from 'vue'
import { useUserStore } from '~/stores/userStore'

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()
    const userStore = useUserStore()

    console.log('Auth0 Config:', {
        domain: config.public.auth0.domain,
        clientId: config.public.auth0.clientId,
        redirectUri: config.public.auth0.redirectUri,
        audience: config.public.auth0.audience
    })

    const auth0 = createAuth0({
        domain: config.public.auth0.domain,
        clientId: config.public.auth0.clientId,
        authorizationParams: {
            redirect_uri: `${window.location.origin}/auth/callback`,
            audience: config.public.auth0.audience,
        },
    })

    nuxtApp.vueApp.use(auth0)

    watch(() => auth0.isAuthenticated.value, (isAuthenticated) => {
        console.log('Is authenticated:', isAuthenticated)
        if (isAuthenticated) {
            console.log('Authenticated user:', auth0.user.value)
            userStore.setUser(auth0.user.value)
        } else {
            userStore.clearUser()
        }
    }, { immediate: true })

    // Add another watcher for user changes
    watch(() => auth0.user.value, (user) => {
        if (user) {
            console.log('User updated:', user)
            userStore.setUser(user)
        }
    })

    return {
        provide: {
            auth0,
        },
    }
})