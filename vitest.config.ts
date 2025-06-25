import { defineConfig } from 'vitest/config'
import Vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
export default defineConfig({
    plugins: [
        Vue()
    ],
    test: {
        globals: true,
        environment: 'jsdom',
    },
    resolve: {
        alias: {
            '#imports': resolve(__dirname, './.nuxt/imports.d.ts'),
            '~': resolve(__dirname, './'),
        },
    }
})