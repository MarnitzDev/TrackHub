
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  ssr: false,
  css: [
    '~/assets/css/main.css'
  ],
  modules: [
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/ui',
    '@nuxt/test-utils',
    'pinia-plugin-persistedstate/nuxt',
    '@sidebase/nuxt-auth'
  ],
  vite: {
    test: {
      globals: true,
      environment: 'jsdom',
    }
  },
  auth: {
    baseURL: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    enableGlobalAppMiddleware: true,
    provider: {
      type: 'authjs'
    },
    globalAppMiddleware: {
      isEnabled: true,
      allow404WithoutAuth: true,
      addDefaultCallbackUrl: true,
      exclude: ['/signin']
    },
    origin: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    }
  }
})