
import { defineStore } from 'pinia'

interface User {
    id: string;
    email?: string;
    name?: string;
    picture?: string;
    [key: string]: any;
}

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null as User | null,
        isGuest: false
    }),
    getters: {
        isAuthenticated: (state) => !!state.user && !state.isGuest,
        isGuestUser: (state) => state.isGuest,
        userMetadata: (state) => state.user || {}
    },
    actions: {
        setUser(user: User | null) {
            this.user = user
            this.isGuest = false
        },
        setGuest() {
            this.user = {
                id: 'guest',
                name: 'Guest User',
                email: 'guest@example.com',
                picture: '/default-avatar.png'
            }
            this.isGuest = true
        },
        clearUser() {
            this.user = null
            this.isGuest = false
        },
        updateUser(userData: Partial<User>) {
            if (this.user) {
                this.user = { ...this.user, ...userData }
            }
        }
    },
    persist: true
})