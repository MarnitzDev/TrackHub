
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { createAuth0 } from '@auth0/auth0-vue'

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()

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

    return {
        provide: {
            auth0,
        },
    }
})