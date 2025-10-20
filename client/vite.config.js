import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Порт вашего Express-сервера (по умолчанию 5000)
const EXPRESS_PORT = 5000;

export default defineConfig({
  plugins: [react()],
  server: {
    // ⭐ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ ЗДЕСЬ
    proxy: {
      // Все запросы, начинающиеся с /api
      '/api': {
        // Перенаправляем на Express-сервер
        target: `http://localhost:${EXPRESS_PORT}`, 
        // Если ваш бэкенд использует HTTPS (менее вероятно)
        secure: false, 
        // Перезаписываем хост-заголовок
        changeOrigin: true, 
      },
    },
    // Убедитесь, что фронтенд работает на 5173
    port: 5173, 
  },
});
