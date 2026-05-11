import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'https://cv-mister-backend.onrender.com',
      '/generate-pdf': 'https://cv-mister-backend.onrender.com',
      '/socket.io': {
        target: 'https://cv-mister-backend.onrender.com',
        ws: true,
      },
      '/n8n': {
        target: 'https://ahmeddd111.app.n8n.cloud',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/n8n/, ''),
      },
    },
  },
})
