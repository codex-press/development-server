'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = start;
exports.broadcast = broadcast;

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _repository_list = require('./repository_list');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ws = void 0;

function start(server) {
  ws = new _ws2.default.Server({ server: server });

  ws.on('connection', function connection(ws) {
    var client = ws._socket.remoteAddress + ':' + ws._socket.remotePort;

    console.log(_chalk2.default.magenta('WebSocket connect: ' + client));
    ws.send(JSON.stringify({ fileList: (0, _repository_list.getFileList)() }));
  });
}

function broadcast(message) {
  if (!ws) return;
  message = JSON.stringify(message);
  ws.clients.map(function (client) {
    return client.send(message);
  });
}