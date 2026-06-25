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

// Broadcasting cancel emergency which triggers a page refresh on all client screens.
function broadcastCancel() {
  console.log('🔄 Broadcasting cancel emergency (client refresh)...');
  const payload = JSON.stringify({ type: 'cancelEmergency' });
  for (let client of clients) {
    if (client.readyState === 1) client.send(payload);
  }
}

// HTTP fallback: trigger the emergency screen even when there is no interactive
// terminal attached (e.g. running under tmux/pm2/systemd, or from another SSH
// session).
// Visiting https://trigger.iid.hapke.me/ (via nginx) also hits this route.
function handleTriggerRequest(req, res) {
  let action = req.query.action || req.body?.action;

  if (action === 'start') {
    broadcastEmergency();
    return res.json({ ok: true, action: 'start', devices: clients.size });
  } else if (action === 'cancel') {
    broadcastCancel();
    return res.json({ ok: true, action: 'cancel', devices: clients.size });
  }

  // If action was passed via request query but not in a API-like format,
  // we redirect back to /trigger after performing the action.
  if (action) {
    if (action === 'start') broadcastEmergency();
    if (action === 'cancel') broadcastCancel();

    const wantsJson = req.query.format === 'json'
      || req.get('accept')?.includes('application/json');

    if (wantsJson) {
      return res.json({ ok: true, action, devices: clients.size });
    }
    return res.redirect('/trigger');
  }

  const wantsJson = req.query.format === 'json'
    || req.get('accept')?.includes('application/json');

  if (wantsJson) {
    return res.json({ ok: true, devices: clients.size });
  }

  res.type('html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Notfall-Steuerung</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090a0f;
      --card-bg: rgba(255, 255, 255, 0.03);
      --card-border: rgba(255, 255, 255, 0.08);
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --primary: #ff4a5a;
      --primary-hover: #ff606e;
      --primary-glow: rgba(255, 74, 90, 0.15);
      --secondary: #3b82f6;
      --secondary-hover: #60a5fa;
      --secondary-glow: rgba(59, 130, 246, 0.15);
      --neutral: #374151;
      --neutral-hover: #4b5563;
      --success: #10b981;
    }
    
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      display: grid;
      place-items: center;
      min-height: 100vh;
      margin: 0;
      background: radial-gradient(circle at top, #1e1b29 0%, var(--bg) 70%);
      color: var(--text);
      overflow-x: hidden;
    }

    .container {
      width: 100%;
      max-width: 440px;
      padding: 1.5rem;
      box-sizing: border-box;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: 24px;
      padding: 2.5rem 2rem;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .card:hover {
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
    }

    h1 {
      font-size: 2rem;
      font-weight: 800;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      font-size: 0.95rem;
      color: var(--text-muted);
      margin-bottom: 2rem;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 2.5rem;
      transition: all 0.3s ease;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background-color: var(--success);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--success);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    .button-group {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .btn {
      font-family: inherit;
      font-size: 1rem;
      font-weight: 700;
      padding: 1.1rem;
      border: none;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-start {
      background: linear-gradient(135deg, var(--primary) 0%, #e11d48 100%);
      color: white;
      box-shadow: 0 4px 15px var(--primary-glow);
    }

    .btn-start:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px var(--primary-glow);
      filter: brightness(1.1);
    }

    .btn-start:active {
      transform: translateY(0);
    }

    .btn-cancel {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .btn-cancel:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-2px);
    }

    .btn-cancel:active {
      transform: translateY(0);
    }

    /* Notification/Toast styling */
    .toast {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translate(-50%, 100px);
      background: rgba(17, 24, 39, 0.95);
      border: 1px solid var(--card-border);
      padding: 1rem 1.5rem;
      border-radius: 16px;
      font-size: 0.95rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      z-index: 100;
      pointer-events: none;
    }

    .toast.show {
      transform: translate(-50%, 0);
    }

    .toast-icon {
      font-size: 1.25rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>IID System Hub</h1>
      <p class="subtitle">Notfall-Steuerungspanel</p>
      
      <div class="status-badge">
        <span class="status-dot"></span>
        <span id="device-count">${clients.size} verbundene(s) Gerät(e)</span>
      </div>

      <div class="button-group">
        <button class="btn btn-start" onclick="triggerAction('start')">
          ⚠️ Notfall starten
        </button>
        <button class="btn btn-cancel" onclick="triggerAction('cancel')">
          🔄 Notfall abbrechen
        </button>
      </div>
    </div>
  </div>

  <div id="toast" class="toast">
    <span id="toast-icon" class="toast-icon"></span>
    <span id="toast-message"></span>
  </div>

  <script>
    async function triggerAction(action) {
      try {
        const res = await fetch('/trigger', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action })
        });
        const data = await res.json();
        
        if (data.ok) {
          // Update device count
          document.getElementById('device-count').textContent = 
            data.devices + ' verbundene(s) Gerät(e)';
          
          showToast(
            action === 'start' ? '⚠️' : '🔄', 
            action === 'start' ? 'Notfall Signal gesendet!' : 'Notfall abgebrochen & Client neu geladen!'
          );
        } else {
          showToast('❌', 'Fehler beim Ausführen der Aktion');
        }
      } catch (err) {
        showToast('❌', 'Netzwerk- oder Serverfehler');
        console.error(err);
      }
    }

    function showToast(icon, message) {
      const toast = document.getElementById('toast');
      document.getElementById('toast-icon').textContent = icon;
      document.getElementById('toast-message').textContent = message;
      
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }
  </script>
</body>
</html>`);
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
