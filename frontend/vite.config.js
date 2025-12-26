import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    // Prefer 5174 to avoid common port conflicts (can be overridden via env VITE_DEV_PORT)
    port: Number(process.env.VITE_DEV_PORT) || 5174,
    strictPort: false, // allow automatic fallback if the port is taken
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
})