import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        isGuest: false,
    }),
    getters: {
        isAuthenticated: (state) => !!state.user || state.isGuest,
        userMetadata: (state) => state.user,
    },
    actions: {
        setUser(userData) {
            this.user = userData
            this.isGuest = false
        },
        clearUser() {
            this.user = null
            this.isGuest = false
        },
        setGuest() {
            this.isGuest = true
            this.user = null
        },
    },
})