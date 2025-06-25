import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '#imports': resolve(__dirname, './.nuxt/imports.d.ts'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
    },
})