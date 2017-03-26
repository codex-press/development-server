'use strict';

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var wsServer = new require('ws').Server({ server: server });

wsServer.on('connection', function connection(ws) {
  var sock = ws._socket;
  console.log('WS connect ' + sock.remoteAddress + ':' + sock.remotePort);
  ws.send(JSON.stringify({ version: version, fileList: fileList }));
});

var chokidar = require('chokidar');

// ignores .dotfiles and libraries
var watcher = chokidar.watch(reposDir, {
  ignored: [/[\/\\]\./, /.*node_modules.*/]
});

watcher.on('all', function (event, filename) {
  if (event == 'add') fileAdd(filename);else if (event == 'unlink') fileRemove(filename);else if (event == 'change') fileChange(filename);
});

function broadcast(message) {
  message = JSON.stringify(message);
  wsServer.clients.map(function (client) {
    return client.send(message);
  });
}
