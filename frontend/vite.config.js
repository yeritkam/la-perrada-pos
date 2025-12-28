import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'dannielle-psittacistic-venus.ngrok-free.dev',  // Tu dominio ngrok
      '.ngrok-free.dev'  // Permite TODOS los subdominios ngrok (recomendado)
    ]
  }
})