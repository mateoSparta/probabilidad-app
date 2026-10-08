import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],

  // Rutas relativas en el bundle. En GitHub Pages la app vive en
  // /<repo>/ y no en la raíz del dominio; con `./` funciona ahí, en la
  // raíz, en un subdirectorio cualquiera y abriendo el index.html local,
  // sin tener que hardcodear el nombre del repo.
  base: './',

  // El contenido vive en content/ (fuera de src/). Hay que permitir que
  // Vite lo sirva en desarrollo.
  server: { fs: { allow: ['.'] } },
})
