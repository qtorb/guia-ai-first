import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages sirve el proyecto en /guia-ai-first/, no en la raíz.
  base: '/guia-ai-first/',
})
