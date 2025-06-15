
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        isAuthenticated: false,
    }),
    actions: {
        setUser(userData) {
            console.log('UserStore: Setting user', userData)
            this.user = userData
            this.isAuthenticated = true
        },
        clearUser() {
            console.log('UserStore: Clearing user')
            this.user = null
            this.isAuthenticated = false
        },
        setGuest() {
            console.log('UserStore: Setting guest user')
            this.user = { name: 'Guest' }
            this.isAuthenticated = true
        }
    },
    persist: true, // This will persist the store state in localStorage
})