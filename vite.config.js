import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',  // важно для абсолютных путей ассетов на домене верхнего уровня
})