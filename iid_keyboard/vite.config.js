import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  server: {
    host: true,
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev'],
    proxy: {
      // This interceptor automatically routes WebSocket traffic straight to your server
      '/ws-hub': {
        target: 'http://localhost:7777',
        ws: true, // Enables WebSocket proxying
        rewrite: (path) => path.replace(/^\/ws-hub/, '')
      }
    }
  }
});