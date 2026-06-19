const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const readline = require('readline');

const app = express();
const PORT = process.env.PORT || 7777;

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => res.send('WebSocket Hub is running!'));

let clients = new Set();

// Single source of truth for the emergency broadcast so both the terminal
// ENTER key and the HTTP fallback trigger share identical behavior.
function broadcastEmergency() {
  console.log('⚠️ Broadcasting emergency trigger...');
  const payload = JSON.stringify({ type: 'toggleEmergency' });
  for (let client of clients) {
    if (client.readyState === 1) client.send(payload);
  }
}

// HTTP fallback: trigger the emergency screen even when there is no interactive
// terminal attached (e.g. running under tmux/pm2/systemd, or from another SSH
// session). From the server you can simply run:  curl localhost:7777/trigger
app.all('/trigger', (req, res) => {
  broadcastEmergency();
  res.json({ ok: true, devices: clients.size });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 WebSocket Hub running on http://localhost:${PORT}`);
  console.log(`💡 Press ENTER in this terminal to trigger the emergency screen!`);
  console.log(`   (or from anywhere on the server: curl localhost:${PORT}/trigger)`);
});

// HARDENED WEBSOCKET CONFIGURATION FOR REVERSE PROXIES
const wss = new WebSocketServer({
  noServer: true, // We handle the protocol upgrade event manually below
});

// Handle the HTTP -> WebSocket upgrade cleanly behind proxies (nginx / Vite).
// Both apps connect to a same-origin "/ws" path which the proxy forwards here,
// so we only accept upgrades on that path and reject anything else.
server.on('upgrade', (request, socket, head) => {
  const pathname = (request.url || '').split('?')[0];
  if (pathname !== '/ws' && pathname !== '/') {
    socket.destroy();
    return;
  }
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Terminal ENTER trigger. Works over SSH when this process runs in the
// foreground of an interactive session. If stdin is not a TTY (detached/piped)
// we skip readline and rely on the /trigger HTTP endpoint above instead.
if (process.stdin.isTTY) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  rl.on('line', () => broadcastEmergency());
} else {
  console.log('ℹ️ No interactive TTY detected — use the /trigger HTTP endpoint to fire the emergency screen.');
}

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`🔌 New device connected! Total devices: ${clients.size}`);

  // Heartbeat protocol to keep proxies from killing idle connections
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (message) => {
    try {
      const stringMessage = message.toString();
      const parsedData = JSON.parse(stringMessage);
      console.log('Broadcasting payload:', parsedData);

      // Transparently pipes "openKeyboard", "closeKeyboard", and keys across devices
      for (let client of clients) {
        if (client !== ws && client.readyState === 1) {
          client.send(stringMessage);
        }
      }
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`❌ Device disconnected. Total devices: ${clients.size}`);
  });

  ws.on('error', (err) => {
    console.error('Socket error caught:', err.message);
  });
});

// Actively ping clients to keep the proxy channel open
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 20000);

wss.on('close', () => {
  clearInterval(interval);
});
