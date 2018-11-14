const express = require('express');
const io = require('socket.io')();
const debug = require('debug')('RRS:Epicenter');

const app = express();
const port = 3000;

const connections = [];
io.on('connection', (socket) => {
  socket.emit('identify', (type) => {
    connections.push({
      id: socket.id,
      type,
    });
  });
});

app.get('/', (req, res) => res.send(connections));

app.listen(port, () => debug(`Example app listening on port ${port}!`));
io.listen(8080);
