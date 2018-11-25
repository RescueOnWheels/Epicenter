const express = require('express');
const io = require('socket.io')();
const debug = require('debug')('RRS:Epicenter');

const app = express();
const port = 3030;

// set the view engine to use handlebars
app.set('view engine', 'hbs');
app.set('views', `${__dirname}/views`);

const connections = [];
io.on('connection', (socket) => {
  socket.emit('identify', (type) => {
    connections.push({
      id: socket.id,
      ip: socket.handshake.address,
      isCockpit: type === 'cockpit',
      isRover: type === 'rover',
    });
  });
});

app.get('/', (req, res) => {
  res.render('home', { cockpits: connections.filter(c => c.isCockpit), rovers: connections.filter(c => c.isRover) });
});

app.get('/:a/:b', (req, res) => {
  const a = io.sockets.connected[req.params.a];
  const b = io.sockets.connected[req.params.b];
  if (a === undefined || b === undefined) {
    res.redirect('/', 418);
    return;
  }

  a.emit('target', b.handshake.address.replace('::ffff:', ''));
  b.emit('target', a.handshake.address.replace('::ffff:', ''));

  /**
   * The server successfully processed the request and is not returning any content.
   */
  res.redirect('/', 204);
});

app.listen(port, () => debug(`Example app listening on port ${port}!`));
io.listen(8080);
