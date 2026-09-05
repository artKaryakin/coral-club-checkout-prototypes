import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // Плавающая кнопка Vue DevTools мешала смотреть макет на реальных
  // устройствах — убрала плагин. При необходимости отладки компонентов
  // можно вернуть vite-plugin-vue-devtools обратно.
  plugins: [vue()],

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
    // true — слушает на всех сетевых интерфейсах, не только localhost,
    // чтобы стенд был виден с телефона в той же Wi-Fi сети.
    host: true,
    port: 5173,
    strictPort: false,
    open: false,
  },
})
