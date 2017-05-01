'use strict';

var _portfinder = require('portfinder');

var _portfinder2 = _interopRequireDefault(_portfinder);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _open = require('open');

var _open2 = _interopRequireDefault(_open);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _repository_list = require('./repository_list');

var _repository_list2 = _interopRequireDefault(_repository_list);

var _socket = require('./socket');

var _socket2 = _interopRequireDefault(_socket);

var _routes = require('./routes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _repository_list.updateRepoList)();

var app = (0, _express2.default)();
app.set('view engine', 'pug');

var server = _http2.default.createServer(app);
(0, _socket2.default)(server);

// middleware
app.use((0, _morgan2.default)('tiny'));
app.use(_express2.default.static('public'));
app.use('/api', _api2.default);

// routes
app.get('inline', _routes.sendInline);
app.get('*.(js|css)', _routes.sendAsset);
app.get(/^[^.]*$/, _routes.sendHTML);

_portfinder2.default.getPort(function (err, port) {

  server.listen(port, function () {
    return console.log('listening ' + port);
  });

  // this when run from command line as NPM package
  if (/bin\/main\.js$/.test(require.main.filename)) (0, _open2.default)('http://localhost:' + port + '/');
});