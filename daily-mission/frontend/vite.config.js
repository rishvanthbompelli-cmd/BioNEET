import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['.ngrok-free.dev', 'localhost', '127.0.0.1'],
  },
  build: {
    // Disable source maps in production for smaller bundles
    sourcemap: false,
    // Inline small assets (< 4KB) as base64
    assetsInlineLimit: 4096,
    // Warn if chunk exceeds 600KB
    chunkSizeWarningLimit: 600,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom')) return 'vendor-react';
          if (id.includes('node_modules/react-router')) return 'vendor-react';
          if (id.includes('node_modules/react/')) return 'vendor-react';
          if (id.includes('node_modules/framer-motion')) return 'vendor-motion';
        },
      },
    },
  },
})
