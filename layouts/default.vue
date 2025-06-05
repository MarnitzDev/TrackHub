<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
</script>

<template>
  <div class="flex flex-col h-screen">
    <AppHeader class="bg-white shadow-md flex-shrink-0" />
    <main class="flex-1 overflow-auto p-6">
      <slot />
    </main>
  </div>
</template>