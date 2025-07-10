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
    origin: process.env.ORIGIN,
    globalAppMiddleware: {
      isEnabled: true
    },
    provider: {
      type: 'authjs',
      addDefaultCallbackUrl: true
    },
    baseUrl: 'https://trackhub-production.up.railway.app:8080',
    session: {
      enableRefreshPeriodically: false,
      enableRefreshOnWindowFocus: false
    }
  },
  runtimeConfig: {
    public: {
      authOrigin: process.env.ORIGIN || 'http://localhost:3000'
    }
  }
})