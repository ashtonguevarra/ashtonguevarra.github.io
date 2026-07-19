import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    minify: false,
    cssMinify: false,
    rollupOptions: {
      maxParallelFileOps: 2,
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react-dom')) return 'react-dom';
          if (id.includes('node_modules/react')) return 'react';
          
          if (id.includes('node_modules/react-router-dom')) return 'router';
          if (id.includes('node_modules/react-icons')) return 'icons';
          if (id.includes('node_modules/tailwindcss') || id.includes('lightningcss')) return 'css';
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    allowedHosts: true,
    hmr: false,
  },
})