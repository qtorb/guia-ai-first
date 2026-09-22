import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Con dominio propio, Pages sirve el proyecto en la RAÍZ del dominio
  // (guia.qtorb.com/), no en /guia-ai-first/ como hacía en qtorb.github.io.
  // El dominio va en public/CNAME, que viaja dentro del artefacto.
  //
  // Esto y el CNAME salen juntos a propósito: uno sin el otro deja una
  // ventana con todos los recursos en 404.
  base: '/',
})
