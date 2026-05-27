const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const readline = require('readline');

const app = express();
const PORT = 7777;

app.use(cors({
  origin: '*', 
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => res.send('WebSocket Hub is running!'));

const server = app.listen(PORT, () => {
  console.log(`🚀 WebSocket Hub running on http://localhost:${PORT}`);
  console.log(`💡 Press ENTER in this terminal to trigger the emergency screen!`);
});

// HARDENED WEBSOCKET CONFIGURATION FOR TUNNELS
const wss = new WebSocketServer({ 
  noServer: true, // We will handle the protocol upgrade event manually below
});

let clients = new Set();

// Handle the HTTP -> WebSockets upgrade protocol cleanly for cloud proxies
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Updated terminal action to broadcast an explicit open/trigger flow
rl.on('line', () => {
  console.log('⚠️ Enter pressed in terminal! Broadcasting emergency trigger...');
  const payload = JSON.stringify({ type: 'toggleEmergency' });
  
  for (let client of clients) {
    if (client.readyState === 1) {
      client.send(payload);
    }
  }
});

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`🔌 New device connected! Total devices: ${clients.size}`);

  // Setup a heartbeat protocol to keep InstaTunnel from killing the connection
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

// Actively ping clients every 20 seconds to keep the proxy channel open
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