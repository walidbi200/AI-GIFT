import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Custom Contentlayer integration for Vite
function contentlayerPlugin() {
  return {
    name: 'contentlayer',
    buildStart() {
      // This will run contentlayer build process
      // For now, we'll handle this manually or via package.json scripts
      console.log('Contentlayer: Building content...');
    },
    handleHotUpdate({ file, server }) {
      // Hot reload when markdown files change
      if (file.includes('src/content/posts') && file.endsWith('.md')) {
        console.log('Contentlayer: Content file changed, rebuilding...');
        server.ws.send({
          type: 'full-reload'
        });
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Smart Gift Finder',
        short_name: 'GiftFinder',
        description: 'An AI-powered tool to find the perfect gift for any occasion.',
        theme_color: '#ffffff',
        background_color: '#f8fafc',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.webp',
            sizes: '192x192',
            type: 'image/webp'
          },
          {
            src: 'pwa-512x512.webp',
            sizes: '512x512',
            type: 'image/webp'
          }
        ]
      }
    }),
    contentlayerPlugin()
  ],
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