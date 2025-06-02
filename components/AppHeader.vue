<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth, useRouter } from '#imports'

const { status, data, signIn, signOut } = useAuth()
const router = useRouter()

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

const isGuest = computed(() => {
  return status.value === 'unauthenticated' && localStorage.getItem('guestMode') === 'true'
})

const userName = computed(() => {
  if (status.value === 'authenticated') {
    return data.value?.user?.name || 'Authenticated User'
  } else if (isGuest.value) {
    return 'Guest'
  }
  return 'Unknown User'
})

const userAvatar = computed(() => {
  return data.value?.user?.image || 'https://www.gravatar.com/avatar/?d=mp'
})

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const handleSignIn = () => {
  signIn('google')
}

const handleSignOut = () => {
  signOut()
  isUserMenuOpen.value = false
  localStorage.removeItem('guestMode')
  router.push('/login')
}

const switchToSignIn = () => {
  localStorage.removeItem('guestMode')
  router.push('/login')
}
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
            <img :src="userAvatar" :alt="userName" class="h-8 w-8 rounded-full">
            <span class="hidden md:inline">{{ userName }}</span>
            <UIcon name="i-lucide-chevron-down" class="w-4 h-4 text-gray-500" />
          </button>
          <div
              v-if="isUserMenuOpen"
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
          >
            <template v-if="status === 'authenticated'">
              <NuxtLink to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</NuxtLink>
              <NuxtLink to="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</NuxtLink>
              <button @click="handleSignOut" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</button>
            </template>
            <template v-else-if="isGuest">
              <button @click="switchToSignIn" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Switch to Sign In</button>
            </template>
            <template v-else>
              <button @click="handleSignIn" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign in</button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
