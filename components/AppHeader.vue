<script setup lang="ts">
import { ref } from 'vue'

const items = [
  {
    label: 'Dashboard',
    icon: 'i-heroicons-home',
    to: '/'
  },
  {
    label: 'Board',
    icon: 'i-lucide-book-open',
    to: `/board`,
  },
  {
    label: 'Projects',
    icon: 'i-heroicons-rectangle-stack',
    to: '/projects'
  },
  {
    label: 'Tasks',
    icon: 'i-heroicons-clipboard-document-list',
    to: '/tasks'
  },
  {
    label: 'Team',
    icon: 'i-heroicons-user-group',
    to: '/team'
  }
]

const user = ref({
  name: 'John Doe',
  avatar: 'https://i.pravatar.cc/150?img=68'
})

const isUserMenuOpen = ref(false)
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
          <i :class="item.icon" class="mr-2 text-gray-500"></i>
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- User and Actions (Right) -->
      <div class="flex items-center space-x-4">
        <button class="p-2 rounded-full hover:bg-gray-100 text-gray-500">
          <i class="i-heroicons-bell-alert w-5 h-5"></i>
        </button>
        <div class="relative">
          <button
              @click="isUserMenuOpen = !isUserMenuOpen"
              class="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition duration-150 ease-in-out"
          >
            <img :src="user.avatar" :alt="user.name" class="h-8 w-8 rounded-full">
            <span class="hidden md:inline">{{ user.name }}</span>
            <i class="i-heroicons-chevron-down w-4 h-4 text-gray-500"></i>
          </button>
          <div
              v-if="isUserMenuOpen"
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
          >
            <NuxtLink to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</NuxtLink>
            <NuxtLink to="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</NuxtLink>
            <button class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>