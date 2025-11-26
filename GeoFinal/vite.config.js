import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/geogame-Datches1/',
  plugins: [react()],
  resolve: {
    alias: {
      // You can add aliases here if needed, e.g., '@': '/src'
    },
  },
})

