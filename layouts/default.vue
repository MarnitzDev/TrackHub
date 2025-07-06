
<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <AppHeader class="bg-white shadow-md z-10" />
    <div class="flex-1 overflow-hidden">
      <main class="content-container h-full overflow-y-auto pb-8">
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
  height: calc(100vh - var(--header-height) - var(--footer-height));
  padding-bottom: var(--content-bottom-padding);
}

:root {
  --header-height: 64px;
  --footer-height: 57px;
  --content-bottom-padding: 32px;
}
</style>