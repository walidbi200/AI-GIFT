import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Smart Gift Finder',
        short_name: 'GiftFinder',
        description: 'An AI-powered tool to find the perfect gift for any occasion.',
        start_url: '/',
        display: 'standalone',
        background_color: '#f8fafc',
        theme_color: '#ffffff',
        orientation: 'portrait-primary',
        scope: '/',
        lang: 'en',
        categories: ['lifestyle', 'productivity', 'utilities'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ],
        shortcuts: [
          {
            name: 'Find Gifts',
            short_name: 'Gifts',
            description: 'Start finding personalized gift recommendations',
            url: '/',
            icons: [
              {
                src: '/pwa-192x192.png',
                sizes: '192x192'
              }
            ]
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})