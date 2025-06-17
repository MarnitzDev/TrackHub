<script setup lang="ts">
import { useAuth } from '#imports'
import { useUserStore } from '~/stores/userStore'

const { status, data: session } = useAuth()
const userStore = useUserStore()

const user = computed(() => session.value?.user || userStore.user)

const isLoading = computed(() => status.value === 'loading')
const isAuthenticated = computed(() => status.value === 'authenticated')

const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString()
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">User Profile</h1>
    <div v-if="isLoading" class="text-center">
      <p>Loading...</p>
    </div>
    <div v-else-if="isAuthenticated && user">
      <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div class="mb-4 flex items-center">
          <div>
            <h2 class="text-2xl font-semibold">{{ user.name }}</h2>
            <p class="text-gray-600">{{ user.email }}</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 class="text-lg font-semibold mb-2">User Information</h3>
            <p><strong>ID:</strong> {{ user.id }}</p>
            <p><strong>Email Verified:</strong> {{ user.emailVerified ? 'Yes' : 'No' }}</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-2">Account Details</h3>
            <p><strong>Created At:</strong> {{ formatDate(user.createdAt) }}</p>
            <p><strong>Updated At:</strong> {{ formatDate(user.updatedAt) }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <p class="text-center text-red-500">Please sign in to view your profile.</p>
    </div>
  </div>
</template>