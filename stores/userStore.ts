import { defineStore } from 'pinia'

// Define a generic User type
interface User {
    id: string
    email?: string
    user_metadata?: {
        avatar_url?: string
        full_name?: string
        [key: string]: any
    }
    [key: string]: any
}

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null as User | null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.user,
        userMetadata: (state) => state.user?.user_metadata,
    },
    actions: {
        setUser(user: User | null) {
            this.user = user
        },
        clearUser() {
            this.user = null
        },
    },
})