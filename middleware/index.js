const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');

const app = express();
const PORT = 7777;

app.use(cors());
app.use(express.json());

// Keep an HTTP landing message just to verify the port locally
app.get('/', (req, res) => res.send('WebSocket Hub is running!'));

const server = app.listen(PORT, () => {
  console.log(`🚀 WebSocket Hub running on http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });

// Track all open websocket connections
let clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`🔌 New device connected! Total devices: ${clients.size}`);

  // Whenever ANY client sends data (like the keyboard), broadcast it to everyone else
  ws.on('message', (message) => {
    try {
      const parsedData = JSON.parse(message);
      console.log('Broadcasting payload:', parsedData);

      // Forward the raw packet to all other connected apps
      for (let client of clients) {
        if (client !== ws && client.readyState === 1) {
          client.send(JSON.stringify(parsedData));
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
});