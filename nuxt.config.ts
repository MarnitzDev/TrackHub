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
    origin: 'https://trackhub-production.up.railway.app',
    enableGlobalAppMiddleware: true,
    provider: {
      type: 'authjs'
    },
    globalMiddlewareOptions: {
      allow404WithoutAuth: true,
      addDefaultCallbackUrl: true
    }
  },
  runtimeConfig: {
    auth: {
      origin: 'https://trackhub-production.up.railway.app'
    },
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
    }
  }
})