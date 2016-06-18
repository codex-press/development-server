const app = require('express')();

var manifest = {repos: ['coda','stock']};

app.get('/manifest.json', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.json(manifest);
});

app.get('*', (req, res) => {

  if (req.url === 'manifest.json')
    return;

  console.log('serving ' + req.url);

  res.setHeader('Access-Control-Allow-Origin', 'http://localhost');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.send('an asset');
});


app.listen(8000, () => {
  console.log('port 8000: HTTP');
});

var wsServer = new require('ws').Server({ port: 8080 });
console.log('port 8080: WebSocket');

wsServer.on('connection', function connection(ws) {
  // ws.on('message', function incoming(message) {
  //   console.log('received: %s', message);
  // });

  console.log('connect');
  ws.send(JSON.stringify(manifest));
});


var chokidar = require('chokidar');
// ignores .dotfiles and libraries
var watcher = chokidar.watch('./repos',{
  ignored: [ /[\/\\]\./, /.*node_modules.*/],
});

watcher.on('all', (event, path) => {
  if (event == 'add')
    console.log('watching: ', path);
  else if (event == 'change') {
    console.log('update: ', path);
    wsServer.clients.forEach(function each(client) {
      client.send(JSON.stringify({path}));
    });
  }
});


