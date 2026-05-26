const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const readline = require('readline'); // Added for terminal input

const app = express();
const PORT = 7777;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('WebSocket Hub is running!'));

const server = app.listen(PORT, () => {
  console.log(`🚀 WebSocket Hub running on http://localhost:${PORT}`);
  console.log(`💡 Press ENTER in this terminal to trigger the emergency screen!`);
});

const wss = new WebSocketServer({ server });
let clients = new Set();

// Set up readline interface to listen to standard input (terminal)
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Listen for the Enter key press in the terminal
rl.on('line', () => {
  console.log('⚠️ Enter pressed in terminal! Broadcasting emergency trigger...');
  
  const payload = JSON.stringify({ type: 'toggleEmergency' });
  
  for (let client of clients) {
    if (client.readyState === 1) { // 1 === WebSocket.OPEN
      client.send(payload);
    }
  }
});

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`🔌 New device connected! Total devices: ${clients.size}`);

  ws.on('message', (message) => {
    try {
      const parsedData = JSON.parse(message);
      console.log('Broadcasting payload:', parsedData);

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