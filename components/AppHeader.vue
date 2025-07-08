<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '#imports'
import { useUserStore } from '../stores/userStore'
import { useBoardStore } from '../stores/boardStore'

// Stores and Auth
// -----------------------------
const { status, data: session, signIn, signOut } = useAuth()
const userStore = useUserStore()
const boardStore = useBoardStore()

// Computed Properties
// -----------------------------
const isAuthenticated = computed(() => status.value === 'authenticated')
const isUserGuest = computed(() => userStore.isGuest)
const user = computed(() => session.value?.user || userStore.user)
const userMetadata = computed(() => userStore.userMetadata)

const displayName = computed(() => {
  if (isUserGuest.value) return 'Guest User'
  return user.value?.name || userMetadata.value?.full_name || 'User'
})

const avatarUrl = computed(() => {
  if (isUserGuest.value) return '/guest-avatar.png'
  return user.value?.image || userMetadata.value?.avatar_url
})

// Navigation Items
// -----------------------------
const items = [
]

// State
// -----------------------------
const isUserMenuOpen = ref(false)

//=============================================================================
// User Menu Management
//=============================================================================

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const handleSignOut = async () => {
  try {
    await signOut()
    // Clear user data
    userStore.$reset()
    // Clear board data
    boardStore.$reset()
    // Clear any other relevant stores

    // Optionally, you can also clear local storage
    localStorage.clear()

    // Redirect to login page or home page
    navigateTo('/auth/login')
  } catch (error) {
    console.error('Error during sign out:', error)
  }
}

const handleSignIn = () => {
  signIn('google')
  isUserMenuOpen.value = false
}

// Lifecycle Hooks
// -----------------------------
onMounted(() => {
  if (status.value === 'authenticated' && session.value?.user) {
    userStore.setUser(session.value.user)
  } else {
    userStore.$reset()
    boardStore.$reset()
  }
})
</script>

<template>
  <header class="bg-white shadow-md">
    <div class="container mx-auto px-4 py-2 flex items-center justify-between relative">
      <!-- Logo (Left) -->
      <div class="flex items-center">
        <NuxtLink to="/" class="font-bold text-xl text-blue-600">TrackHub</NuxtLink>
      </div>

      <!-- Navigation (Center) -->
      <nav class="hidden md:flex space-x-4">
        <NuxtLink
            v-for="item in items"
            :key="item.label"
            :to="item.to"
            class="flex items-center px-3 py-2 rounded-md hover:bg-gray-100 transition duration-150 ease-in-out"
        >
          <UIcon :name="item.icon" class="mr-2 text-gray-500" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- User and Actions (Right) -->
      <div class="flex items-center space-x-4">
        <div class="relative">
          <UButton
              @click="toggleUserMenu"
              color="neutral"
              variant="link"
              class="flex items-center space-x-2 p-2"
              data-testid="user-menu-button"
          >
            <img
                v-if="avatarUrl"
                :src="avatarUrl"
                alt="User"
                class="h-8 w-8 rounded-full object-cover"
            >
            <UIcon
                v-else
                name="i-lucide-user"
                class="h-8 w-8 p-1 bg-gray-200 rounded-full"
            />
            <span class="hidden md:inline" data-testid="user-display-name">{{ displayName }}</span>
            <UIcon name="i-lucide-chevron-down" class="w-4 h-4 text-gray-500" />
          </UButton>
          <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
          >
            <div
                v-if="isUserMenuOpen"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                data-testid="user-menu-dropdown"
            >
              <template v-if="isAuthenticated">
                <UButton
                    @click="handleSignOut"
                    color="neutral"
                    variant="link"
                    class="block w-full text-left px-4 py-2 text-sm"
                >
                  Sign out
                </UButton>
              </template>
              <template v-else>
                <UButton
                    @click="handleSignIn"
                    color="neutral"
                    variant="link"
                    class="block w-full text-left px-4 py-2 text-sm"
                >
                  Sign In
                </UButton>
              </template>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>