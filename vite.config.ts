import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],
  // El contenido vive en content/ (fuera de src/). Hay que permitir que Vite lo sirva.
  server: { fs: { allow: ['.'] } },
})
