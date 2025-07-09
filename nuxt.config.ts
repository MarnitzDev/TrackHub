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
    globalAppMiddleware: {
      isEnabled: true
    },
    provider: {
      type: 'authjs',
      addDefaultCallbackUrl: true
    },
    baseUrl: process.env.AUTH_ORIGIN || 'http://localhost:3000',
    session: {
      enableRefreshPeriodically: false,
      enableRefreshOnWindowFocus: false
    }
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.AUTH_ORIGIN || 'http://localhost:3000',
    }
  }
})