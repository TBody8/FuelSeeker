import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'https://sedeaplicaciones.minetur.gob.es',
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api/, '/ServiciosRESTCarburantes/PreciosCarburantes'),
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'https://sedeaplicaciones.minetur.gob.es',
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api/, '/ServiciosRESTCarburantes/PreciosCarburantes'),
      },
    },
  },
})