import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss(),],server: {
    allowedHosts: [
      "35db34a59967.ngrok-free.app" 
    ],
    host: true, 
    port: 5173, 
  }
})
