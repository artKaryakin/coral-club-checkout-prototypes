import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        // Токены, брейкпоинты и миксины (mediaMinWidth, paletteColor, ...)
        // доступны во всех <style lang="scss"> без ручного @use.
        additionalData: `@use "@/styles/core" as *;\n`,
      },
    },
  },

  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
    open: false,
  },
})
