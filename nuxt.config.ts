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
    originEnvKey: 'ORIGIN',
    secret: process.env.AUTH_SECRET,
    globalAppMiddleware: {
      isEnabled: true
    },
    provider: {
      type: 'authjs',
      addDefaultCallbackUrl: true
    },
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL,
    session: {
      enableRefreshPeriodically: false,
      enableRefreshOnWindowFocus: false
    }
  },
  runtimeConfig: {
    public: {
      authOrigin: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  }
})