<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useSupabaseClient } from '#imports'

const router = useRouter()
const supabase = useSupabaseClient()

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

const goToLogin = () => {
  router.push('/auth/login')
}

const signOut = async () => {
  try {
    await supabase.auth.signOut()
    // Close the user menu
    isUserMenuOpen.value = false
    // Redirect to home page or login page after sign out
    router.push('/')
  } catch (error) {
    console.error('Error signing out:', error)
  }
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
            <img src="https://www.gravatar.com/avatar/?d=mp" alt="User" class="h-8 w-8 rounded-full">
            <span class="hidden md:inline">User</span>
            <UIcon name="i-lucide-chevron-down" class="w-4 h-4 text-gray-500" />
          </button>
          <div
              v-if="isUserMenuOpen"
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
          >
            <button @click="goToLogin" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign in</button>
            <button @click="signOut" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>