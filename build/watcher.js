'use strict';

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _socket = require('./socket');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var watcher = _chokidar2.default.watch('./public');

watcher.on('all', function (event, filename) {
  (0, _socket.broadcast)(filename);
});