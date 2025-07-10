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
    originEnvKey: 'NUXT_PUBLIC_SITE_URL',
    secret: process.env.AUTH_SECRET,
    enableGlobalAppMiddleware: true,
    provider: {
      type: 'authjs',
      addDefaultCallbackUrl: false
    },
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL,
    session: {
      enableRefreshPeriodically: false,
      enableRefreshOnWindowFocus: false
    }
  },
  nitro: {
    preset: 'node-server',
    cors: {
      credentials: true,
      origin: [process.env.NUXT_PUBLIC_SITE_URL, 'https://accounts.google.com'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
  },
  runtimeConfig: {
    public: {
      authOrigin: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  }
})