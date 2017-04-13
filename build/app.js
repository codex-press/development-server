'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _opn = require('opn');

var _opn2 = _interopRequireDefault(_opn);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _socket = require('./socket');

var _socket2 = _interopRequireDefault(_socket);

var _css = require('./css');

var _css2 = _interopRequireDefault(_css);

var _html = require('./html');

var _html2 = _interopRequireDefault(_html);

var _javascript = require('./javascript');

var _javascript2 = _interopRequireDefault(_javascript);

var _inline = require('./inline');

var _inline2 = _interopRequireDefault(_inline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var server = _http2.default.createServer(app);

(0, _socket2.default)(server);

app.set('view engine', 'pug');

app.use(_express2.default.static('public'));

app.use('/api', _api2.default);

app.get(/^[^.]*$/, _html2.default);

app.get(/\.css$/, _css2.default);
app.get(/\.js$/, _javascript2.default);
app.get(/\.(html|svg|ttf|woff)$/, _inline2.default);

server.listen(_config2.default.port, function () {
  return console.log('listening ' + _config2.default.port);
});

// this when run from command line as NPM package

if (!_config2.default.development) (0, _opn2.default)('http://localhost:' + _config2.default.port + '/');