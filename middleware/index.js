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
// Visiting https://trigger.iid.hapke.me/ (via nginx) also hits this route.
function handleTriggerRequest(req, res) {
  broadcastEmergency();
  const payload = { ok: true, devices: clients.size };

  const wantsJson = req.query.format === 'json'
    || req.get('accept')?.includes('application/json');

  if (req.method === 'GET' && !wantsJson) {
    res.type('html').send(`<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Notfall ausgelöst</title>
  <style>
    body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #1a1a1a; color: #f5f5f5; }
    main { text-align: center; padding: 2rem; }
    h1 { color: #ff3e00; margin-bottom: 0.5rem; }
    p { opacity: 0.85; }
  </style>
</head>
<body>
  <main>
    <h1>Notfall ausgelöst</h1>
    <p>Signal an ${payload.devices} verbundene${payload.devices === 1 ? 's' : ''} Gerät${payload.devices === 1 ? '' : 'e'} gesendet.</p>
  </main>
</body>
</html>`);
    return;
  }

  res.json(payload);
}

app.all('/trigger', handleTriggerRequest);

const server = app.listen(PORT, () => {
  console.log(`🚀 WebSocket Hub running on http://localhost:${PORT}`);
  console.log(`💡 Press ENTER in this terminal to trigger the emergency screen!`);
  console.log(`   (or: curl localhost:${PORT}/trigger  |  open https://trigger.iid.hapke.me/)`);
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
