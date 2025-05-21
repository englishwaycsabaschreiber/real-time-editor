const express = require('express');
const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const FILE_PATH = path.join(__dirname, 'document.html');

app.use(express.static('public'));

let documentContent = fs.existsSync(FILE_PATH)
  ? fs.readFileSync(FILE_PATH, 'utf8')
  : '<p>hello,</p><p>ide írj!</p>';

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'init', content: documentContent }));

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'update') {
      documentContent = data.content;
      fs.writeFileSync(FILE_PATH, documentContent);
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'update', content: documentContent }));
        }
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Szerver fut: http://localhost:${PORT}`);
});
