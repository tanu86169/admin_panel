import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // Ye line yahan bhi add kar di hai bhai
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
  host: "0.0.0.0",
  port: 5173,
}
})