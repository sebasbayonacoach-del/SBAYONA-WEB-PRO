/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { emitRouteHtml } from './vite/emitRouteHtml.js'

export default defineConfig({
  // ── AISLAMIENTO (copia de trabajo, no el repo) ──────────────────────────────
  // node_modules es un junction al repo real. Si la cachá de Vite cayera ahí se
  // escribiría dentro del árbol que está ocupando la otra sesión, así que cacheá
  // y salida se sacan fuera. Sin esto, levantar este servidor molestaría al suyo.
  cacheDir: '.vite-cache',
  server: { port: 5199, strictPort: true },
  preview: { port: 5199, strictPort: true },
  // ── fin del aislamiento ─────────────────────────────────────────────────────
  plugins: [
    react(),
    // Genera un HTML por ruta + sitemap.xml + robots.txt. Ver vite/emitRouteHtml.js.
    emitRouteHtml(),
  ],
  build: {
    /**
     * El aviso por defecto salta a 500 kB y vendor-three siempre lo supera:
     * three.js pesa lo que pesa. Se sube el umbral para que el aviso vuelva a
     * significar algo y no se ignore por costumbre.
     */
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        /**
         * Fase 7B (hallazgo 7A-01): manualChunks pasó de forma objeto a forma
         * FUNCIÓN. La forma objeto asigna paquetes a chunks por nombre, pero
         * deja que Rollup coloque los MÓDULOS COMPARTIDOS que esos paquetes
         * reexportan (el helper de preload de Vite, un createRoot que fiber
         * incluye) donde le convenga — y acababan dentro de vendor-three, con
         * lo que el chunk de entrada de TODAS las rutas lo importaba de forma
         * estática (216,48 kB gzip pagados en cada visita). La forma función
         * clasifica cada módulo por su id real: los paquetes 3D van a su chunk
         * y TODO lo demás (incluidos los runtime helpers que comparten) cae en
         * los chunks normales del grafo. Se mantiene la misma separación por
         * ciclo de vida de caché que justificaba el original: three y framer
         * cambian con sus releases, react cambia poco.
         */
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (/[\\/](three|@react-three)[\\/]/.test(id)) return 'vendor-three'
            // ÍTEM 3a: postprocessing y @react-three/postprocessing van a
            // vendor-three por REGLA explícita (antes caían ahí por accidente
            // del grafo). Cubre el paquete base y el wrapper de R3F.
            if (/[\\/]postprocessing[\\/]/.test(id)) return 'vendor-three'
            if (/[\\/](react|react-dom|react-router|react-router-dom)[\\/]/.test(id)) return 'vendor-react'
            if (id.includes('framer-motion')) return 'vendor-motion'
            // ÍTEM 3b: UI diferida (CartDrawer/Toaster van con lazy en Layout)
            // + SEO: sonner, vaul y helmet-async comparten vendor-ui, fuera
            // del entry. HelmetProvider (main.jsx) y toast() (Programs/Shop)
            // lo importan como chunk separado, no dentro del entry.
            if (/[\\/](sonner|vaul|react-helmet-async)[\\/]/.test(id)) return 'vendor-ui'
          }
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    testTimeout: 15000,
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
})
