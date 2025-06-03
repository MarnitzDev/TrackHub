<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useUserStore } from '~/stores/userStore'

const { user, isAuthenticated, isUserGuest, signInWithGoogle, signOut, continueAsGuest, loadUser } = useAuth()
const userStore = useUserStore()

const userMetadata = computed(() => {
  console.log('Current user metadata:', userStore.userMetadata);
  return userStore.userMetadata;
})

const displayName = computed(() => {
  if (isUserGuest.value) {
    return 'Guest User'
  }
  return user.value?.user_metadata?.full_name
})

const avatarUrl = computed(() => {
  if (isUserGuest.value) {
    return '/guest-avatar.png'
  }
  return userMetadata.value?.avatar_url
})

const items = [
  {
    label: 'Dashboard',
    icon: 'i-lucide-home',
    to: '/'
  },
  {
    label: 'Board',
    icon: 'i-lucide-layout-dashboard',
    to: '/board',
  },
  {
    label: 'Projects',
    icon: 'i-lucide-folder',
    to: '/projects'
  },
  {
    label: 'Tasks',
    icon: 'i-lucide-check-square',
    to: '/tasks'
  },
  {
    label: 'Team',
    icon: 'i-lucide-users',
    to: '/team'
  }
]

const isUserMenuOpen = ref(false)

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

onMounted(() => {
  loadUser()
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
          <button
              @click="toggleUserMenu"
              class="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition duration-150 ease-in-out"
          >
            <img
                v-if="avatarUrl"
                :src="avatarUrl"
                alt="User"
                class="h-8 w-8 rounded-full"
            >
            <UIcon
                v-else
                name="i-lucide-user"
                class="h-8 w-8 p-1 bg-gray-200 rounded-full"
            />
            <span class="hidden md:inline">{{ displayName }}</span>
            <UIcon name="i-lucide-chevron-down" class="w-4 h-4 text-gray-500" />
          </button>
          <div
              v-if="isUserMenuOpen"
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
          >
            <template v-if="isAuthenticated">
              <NuxtLink
                  v-if="!isUserGuest"
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Profile
              </NuxtLink>
              <button
                  @click="signOut"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign out
              </button>
            </template>
            <NuxtLink
                v-if="!isAuthenticated"
                to="/auth/login"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign In
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>