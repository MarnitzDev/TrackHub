import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '#imports': resolve(__dirname, './.nuxt/imports.d.ts'),
            '~': resolve(__dirname, './'),
            '@': resolve(__dirname, './'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
    },
})