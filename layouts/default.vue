<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <AppHeader class="bg-white shadow-md z-10" />
    <div class="flex-1 overflow-x-auto overflow-y-hidden">
      <main class="content-container h-full">
        <slot />
      </main>
    </div>
    <footer class="bg-white shadow-md">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-gray-600">
        © {{ new Date().getFullYear() }} TrackHub. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<style scoped>
.content-container {
  padding-left: 2rem;
  padding-right: 2rem;
  min-height: calc(100vh - 64px - 57px);
  overflow-y: auto;
}
</style>