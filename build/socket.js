'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = start;
exports.broadcast = broadcast;

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ws = void 0;

function start(server) {

  ws = new _ws2.default.Server({ server: server });

  ws.on('connection', function connection(ws) {
    var sock = ws._socket;
    console.log('WS connect ' + sock.remoteAddress + ':' + sock.remotePort);
    // ws.send(JSON.stringify({version, fileList}));
  });
}

function broadcast(message) {
  message = JSON.stringify(message);
  ws.clients.map(function (client) {
    return client.send(message);
  });
}