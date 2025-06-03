import { defineStore } from 'pinia'

interface User {
    id: string;
    aud: string;
    email?: string;
    phone?: string;
    app_metadata: {
        provider?: string;
        providers?: string[];
    };
    user_metadata: {
        avatar_url?: string;
        full_name?: string;
        [key: string]: any;
    };
    role?: string;
    created_at: string;
    updated_at: string;
}

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null as User | null,
        isGuest: false
    }),
    getters: {
        isAuthenticated: (state) => !!state.user,
        isGuestUser: (state) => state.isGuest,
        userMetadata: (state) => state.user?.user_metadata || {}
    },
    actions: {
        setUser(user: User | null) {
            this.user = user
            this.isGuest = false
        },
        setGuest() {
            this.user = null
            this.isGuest = true
        },
        clearUser() {
            this.user = null
            this.isGuest = false
        }
    },
    persist: true
})