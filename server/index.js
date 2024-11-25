const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const http = require('http');
const https = require('https');
const { Server } = require('socket.io'); // Import Socket.IO
const prisma = require('./lib/prisma.js');
const chat = require('./api');
const setupSocket = require('./socket');

const port = Number(process.env.PORT);
const useSSL = process.env.USE_SSL === 'true';
const privkey = process.env.PRIVKEY;
const fullchain = process.env.FULLCHAIN;
const whitelist = ['https://toplocs.com', 'http://localhost:5173', 'http://localhost:5174'];
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: whitelist,
  optionsSuccessStatus: 200
}));

app.use('/api/chat', chat);

let server; // Variable to hold the server instance

if (useSSL) {
  const sslOptions = {
    key: fs.readFileSync(privkey),
    cert: fs.readFileSync(fullchain)
  };
  server = https.createServer(sslOptions, app);
  console.log(`Chat plugin is running with SSL on port ${port}`);
} else {
  server = http.createServer(app);
  console.log(`Chat plugin is running on HTTP port ${port}`);
}

const io = new Server(server, {
  cors: {
    origin: whitelist,
    methods: ['GET', 'POST']
  }
});

setupSocket(io);

server.listen(port, () => {
  console.log(`Socket Server has been started`);
});
