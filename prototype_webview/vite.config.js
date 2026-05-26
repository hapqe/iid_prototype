import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

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
  }
})