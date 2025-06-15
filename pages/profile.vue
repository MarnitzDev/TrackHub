
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">User Profile</h1>
    <div v-if="isLoading">
      <p>Loading...</p>
    </div>
    <div v-else-if="isAuthenticated">
      <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="name">
            Name
          </label>
          <input
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              v-model="profileData.name"
              placeholder="Your Name"
          >
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
            Email
          </label>
          <input
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              v-model="profileData.email"
              placeholder="your.email@example.com"
              readonly
          >
        </div>
        <div class="flex items-center justify-between">
          <button
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              @click="updateProfile"
          >
            Update Profile
          </button>
          <button
              class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              @click="signOut"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
    <div v-else>
      <p>Please sign in to view your profile.</p>
      <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          @click="signInWithAuth0"
      >
        Sign In
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'

const { isAuthenticated, isLoading, user, signInWithAuth0, signOut } = useAuth()

const profileData = ref({
  name: '',
  email: ''
})

onMounted(() => {
  if (user.value) {
    profileData.value.name = user.value.name || ''
    profileData.value.email = user.value.email || ''
  }
})

const updateProfile = async () => {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: profileData.value.name,
        email: profileData.value.email,
        auth0Id: user.value?.sub,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to update profile')
    }

    const updatedUser = await response.json()
    console.log('Profile updated:', updatedUser)
    // You might want to update the user in the store here
  } catch (error) {
    console.error('Error updating profile:', error)
    // Handle error (e.g., show an error message to the user)
  }
}
</script>