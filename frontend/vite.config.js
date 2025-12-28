import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  base: "/la-perrada-pos/",
  server: {
    allowedHosts: [
      "dannielle-psittacistic-venus.ngrok-free.dev",
      ".ngrok-free.dev"
    ]
  },
  build: {
    outDir: "dist",
    sourcemap: false
  }
})
