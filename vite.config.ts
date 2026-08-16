import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  build: {
    minify: false,
    cssMinify: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        projects: resolve(__dirname, 'projects.html'),
        blog: resolve(__dirname, 'blog.html'),
        contact: resolve(__dirname, 'contact.html'),
        // Blog posts
        postJellyfin: resolve(__dirname, 'blog/jellyfin.html'),
        postLinuxtheme: resolve(__dirname, 'blog/linux-theme-switcher.html')
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    hmr: false,
  },
})