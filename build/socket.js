'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = start;
exports.broadcast = broadcast;

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _repository_list = require('./repository_list');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ws = void 0;

function start(server) {
  ws = new _ws2.default.Server({ server: server });

  ws.on('connection', function connection(ws) {
    var client = ws._socket.remoteAddress + ':' + ws._socket.remotePort;
    console.log('--WebSocket connect: ' + client);
    // ws.send(JSON.stringify({repositories}));
  });
}

function broadcast(message) {
  if (!ws) return;
  message = JSON.stringify(message);
  ws.clients.map(function (client) {
    return client.send(message);
  });
}