import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://turingmachine.info",
        changeOrigin: true,
        headers: {
          Referer: "https://turingmachine.info/",
          Origin: "https://turingmachine.info",
        },
      },
    },
  },
})
