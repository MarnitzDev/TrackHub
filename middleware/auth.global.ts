export default defineNuxtRouteMiddleware((to, from) => {
    const { status, signIn } = useAuth()

    // If the user is not authenticated and trying to access a protected route
    if (status.value === 'unauthenticated' && to.path !== '/auth/login') {
        // Redirect to login page
        return navigateTo('/auth/login')
    }
})