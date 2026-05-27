import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  server: {
    host: true, // Allow external access via the tunnel
    port: 3001,
    strictPort: true,
    allowedHosts: ['.instatunnel.my', '.ngrok-free.app'],
    hmr: {
      protocol: 'wss', // Use secure web sockets
      // Tells Vite to use the active tunnel URL for hot-reloading connections
      host: 'emergency-keyboar.instatunnel.my', 
      clientPort: 443 // Force it over the public HTTPS port
    }
  }
});