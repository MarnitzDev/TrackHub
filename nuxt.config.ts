// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: [
    '~/assets/css/main.css'
  ],
  modules: [
    '@pinia/nuxt',
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/ui',
    '@nuxt/test-utils',
    '@sidebase/nuxt-auth'
  ],
  auth: {
    isEnabled: true,
    origin: 'http://localhost:3000/api/auth/callback/google',
    basePath: '/api/auth',
    globalAppMiddleware: false,
    signInPage: '/login',
  }
})