import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

// The hub (middleware) WebSocket server. Override with HUB_TARGET if it runs
// somewhere other than localhost:7777.
const HUB_TARGET = process.env.HUB_TARGET || 'ws://localhost:7777'

// Set HMR_HOST to the public hostname when running behind nginx + TLS so the
// HMR client connects over wss:443, e.g.:
//   HMR_HOST=pager.iid.hapke.me npm run dev
const HMR_HOST = process.env.HMR_HOST

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      manifest: {
        name: 'My Svelte PWA',
        short_name: 'SveltePWA',
        description: 'A brilliant fullscreen Svelte application',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'fullscreen', // <--- This forces the fullscreen view mode
        orientation: 'portrait', // Optional: locks orientation if desired
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Recommended for adaptive mobile icons
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    allowedHosts: ['.hapke.me'],
    // Same-origin WebSocket bridge to the hub so the frontend can use /ws.
    proxy: {
      '/ws': {
        target: HUB_TARGET,
        ws: true,
        changeOrigin: true,
      },
    },
    hmr: HMR_HOST
      ? { protocol: 'wss', host: HMR_HOST, clientPort: 443 }
      : undefined,
  }
})