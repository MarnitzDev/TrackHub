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
    origin: process.env.ORIGIN || process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
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
    public: {
      origin: 'https://trackhub.up.railway.app',
      siteUrl: 'https://trackhub.up.railway.app',
    }
  },
  hooks: {
    'build:before': () => {
      console.log('ORIGIN:', process.env.ORIGIN);
      console.log('NUXT_PUBLIC_SITE_URL:', process.env.NUXT_PUBLIC_SITE_URL);
    }
  }
})