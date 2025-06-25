import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        isAuthenticated: false,
    }),
    actions: {
        /**
         * Sets the user data and marks the user as authenticated.
         * @param userData - The user data to be set.
         */
        setUser(userData) {
            console.log('UserStore: Setting user', userData)
            this.user = userData
            this.isAuthenticated = true
        },

        /**
         * Clears the user data and marks the user as not authenticated.
         */
        clearUser() {
            console.log('UserStore: Clearing user')
            this.user = null
            this.isAuthenticated = false
        },

        /**
         * Sets a guest user and marks them as authenticated.
         */
        setGuest() {
            console.log('UserStore: Setting guest user')
            this.user = { name: 'Guest' }
            this.isAuthenticated = true
        }
    },
    persist: true,
})