import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' so the production build runs from any folder or static host.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  // The lazily loaded 3D lab chunk (Three.js + R3F + drei) is ~1.25 MB raw / ~345 kB gzip by design.
  build: { chunkSizeWarningLimit: 1400 },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
