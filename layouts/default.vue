<script setup>
import AppHeader from '~/components/AppHeader.vue'
</script>

<template>
  <div class="flex h-screen">
    <div class="flex flex-col flex-1">
      <AppHeader class="bg-white shadow-md" />
      <main class="flex-1 p-6 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>