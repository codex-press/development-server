'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;
exports.updateRepoList = updateRepoList;
exports.getRepo = getRepo;
exports.getFileList = getFileList;

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _socket = require('./socket');

var _repository = require('./repository');

var _repository2 = _interopRequireDefault(_repository);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var publicWatcher = _chokidar2.default.watch(['./public/main.js', './public/main.css']).on('change', function (name) {
  return (0, _socket.broadcast)({ publicUpdate: name });
});

var list = [];
exports.default = list;
function updateRepoList() {
  var names = Object.keys(_config2.default.repositories);

  exports.default = list = list.reduce(function (list, r) {
    var isRemoved = !names.find(function (n) {
      return r.name == n && r.path && _config2.default.repositories[n].path;
    });

    isRemoved ? r.close() : list.push(r);

    return list;
  }, []);

  names.forEach(function (name) {
    if (list.find(function (r) {
      return r.name === name;
    })) return;

    var path = _config2.default.repositories[name].path;
    var repo = new _repository2.default({ name: name, path: path });

    repo.on('update', function (e) {
      return (0, _socket.broadcast)(e.filename);
    });

    list.push(repo);
  });
}

function getRepo(assetPath) {
  var repoName = assetPath.match(/(.+?)[./]/)[1];
  return list.find(function (r) {
    return r.name === repoName;
  });
}

function getFileList() {
  return list.reduce(function (list, r) {
    list[r.name] = { external: r.external, inline: r.inline, files: r.files };
    return list;
  }, {});
}