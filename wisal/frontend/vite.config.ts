import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // Listen on all interfaces for Docker
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // Use localhost for local development
        changeOrigin: true,
      },
    },
  },
})