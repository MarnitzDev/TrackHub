import { useUserStore } from '~/stores/userStore'

export default defineNuxtRouteMiddleware((to, from) => {
    const userStore = useUserStore()

    console.log("Checking authentication middleware for route: ", to.path)
    console.log("Authentication state:", {
        isAuthenticated: userStore.isAuthenticated,
        isGuest: userStore.isGuest
    })

    // List of routes that don't require authentication
    const publicRoutes = ['/auth/login', '/auth/callback']

    // Allow access to public routes without authentication
    if (publicRoutes.includes(to.path)) {
        console.log("Accessing public route, no authentication required")
        return
    }

    // If user is authenticated (including guests), allow access
    if (userStore.isAuthenticated) {
        console.log("User is authenticated or guest, allowing access")
        return
    }

    // If user is not authenticated and not a guest, redirect to login
    // But prevent redirect loop if already on login page
    if (to.path !== '/auth/login') {
        console.log("User is not authenticated and not guest, redirecting to login")
        return navigateTo('/auth/login')
    }

    console.log("On login page, allowing access")
})