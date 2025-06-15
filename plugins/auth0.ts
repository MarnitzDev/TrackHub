import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { watch } from 'vue'
import { useUserStore } from '~/stores/userStore'
import { createAuth0, Auth0Plugin } from '@auth0/auth0-vue'

export default defineNuxtPlugin(async (nuxtApp) => {
    const config = useRuntimeConfig()
    const userStore = useUserStore()

    console.log('Auth0 Config:', {
        domain: config.public.auth0.domain,
        clientId: config.public.auth0.clientId,
        redirectUri: config.public.auth0.redirectUri,
        audience: config.public.auth0.audience
    })

    let auth0: Auth0Plugin

    try {
        auth0 = createAuth0({
            domain: config.public.auth0.domain,
            clientId: config.public.auth0.clientId,
            authorizationParams: {
                redirect_uri: `${window.location.origin}/auth/callback`,
                audience: config.public.auth0.audience,
            },
            cacheLocation: 'localstorage',
            useRefreshTokens: true,
        })

        nuxtApp.vueApp.use(auth0)

        // Initialize Auth0 and check the authentication state
        await auth0.checkSession()

        watch(() => auth0.isAuthenticated.value, async (isAuthenticated) => {
            console.log('Is authenticated:', isAuthenticated)
            if (isAuthenticated) {
                // Use auth0.user instead of auth0.getUser()
                const user = auth0.user.value
                console.log('Authenticated user:', user)
                if (user) {
                    userStore.setUser(user)
                }
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

    } catch (e) {
        console.error('Failed to initialize Auth0:', e)
        userStore.clearUser()
    }

    return {
        provide: {
            auth0,
        },
    }
})