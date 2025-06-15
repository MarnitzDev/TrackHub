<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100">
    <AppHeader class="bg-white shadow-md z-10" />
    <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
    <footer class="bg-white shadow-md mt-auto">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-gray-600">
        © {{ new Date().getFullYear() }} TrackHub. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<style scoped>
.container {
  max-width: 1280px; /* or any other max-width you prefer */
}
</style>