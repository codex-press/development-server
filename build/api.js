'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _fsPromise = require('fs-promise');

var _fsPromise2 = _interopRequireDefault(_fsPromise);

var _open = require('open');

var _open2 = _interopRequireDefault(_open);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _repository_list = require('./repository_list');

var _repository_list2 = _interopRequireDefault(_repository_list);

var _utility = require('./utility');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();
exports.default = router;


router.use(_bodyParser2.default.json());

// filter requests for localhost only
var message = 'For security, the Codex Development Server only accepts requests from localhost.';

router.get('/config', function (req, res) {
  return res.json(_config2.default);
});

router.use(function (req, res, next) {
  (0, _utility.isLocalhost)(req) ? next() : res.status(403).send(message);
});

router.post('/config', function (req, res) {
  (0, _config.writeConfig)(req.body);
  (0, _repository_list.updateRepoList)();
  res.json(_config2.default);
});

router.get('/path', function (req, res) {
  if (req.query.path.indexOf(_os2.default.type() === 'Windows_NT' ? 'C:\\' : '/')) res.send('false');else _fsPromise2.default.stat(req.query.path + '/.git').then(function (stats) {
    return res.send(stats.isDirectory() ? 'true' : 'false');
  }).catch(function (err) {
    return res.send('false');
  });
});

router.post('/open', function (req, res) {
  (0, _open2.default)(req.query.path);
  res.send('"ok"');
});

router.get('/repositories', function (req, res) {
  Promise.all(_repository_list2.default.map(function (r) {
    return r.ready;
  })).then(function () {
    return res.send((0, _repository_list.getFileList)());
  });
});