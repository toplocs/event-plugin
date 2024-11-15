const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const prisma = require('./lib/prisma');

const api = require('./api');

const url = process.env.URL;
const port = Number(process.env.PORT);

const app = express();

app.use(cors());

app.use(express.static(path.join(__dirname, 'views')));

const httpServer = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ //allow all
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  optionsSuccessStatus: 200
}));

app.use('/api/event', api);

app.listen(port, () => {
  console.log(`Event plugin is running on port ${port}`);
});