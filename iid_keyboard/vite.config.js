import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// The hub (middleware) WebSocket server. Override with HUB_TARGET if it runs
// somewhere other than localhost:7777.
const HUB_TARGET = process.env.HUB_TARGET || 'ws://localhost:7777';

// When served behind a TLS reverse proxy (nginx on hapke.me), Vite's HMR
// client must be told to talk wss over port 443 on the public host. Set
// HMR_HOST to the public hostname to enable this, e.g.:
//   HMR_HOST=keyboard.iid.hapke.me npm run dev
// Locally (no HMR_HOST) the defaults are used so LAN dev keeps working.
const HMR_HOST = process.env.HMR_HOST;

export default defineConfig({
  plugins: [svelte()],
  server: {
    host: true, // Allow external access (LAN / reverse proxy)
    port: 3001,
    strictPort: true,
    allowedHosts: ['.hapke.me', '.ngrok-free.app'],
    // Same-origin WebSocket bridge to the hub so the frontend can use /ws.
    // This keeps everything on one origin so wss works behind nginx + TLS.
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
  },
});
