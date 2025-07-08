
<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <AppHeader class="bg-white shadow-md z-10" />
    <div class="flex-1 overflow-hidden">
      <main class="content-container h-full overflow-y-auto pb-8">
        <slot />
      </main>
    </div>
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