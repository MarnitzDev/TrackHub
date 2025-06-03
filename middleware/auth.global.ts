import { useUserStore } from '~/stores/userStore'

export default defineNuxtRouteMiddleware((to) => {
    const userStore = useUserStore()

    console.log("Checking authentication middleware for route: ", to.path)

    // Allow access to login and callback pages without authentication
    if (to.path === '/auth/login' || to.path === '/auth/callback') {
        return
    }

    // If user is authenticated (including guests), allow access
    if (userStore.isAuthenticated || userStore.isGuest) {
        return
    }

    // If user is not authenticated and not a guest, redirect to login
    return navigateTo('/auth/login')
})