'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;
exports.getRepo = getRepo;
exports.getFileList = getFileList;

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _socket = require('./socket');

var _repository = require('./repository');

var _repository2 = _interopRequireDefault(_repository);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var list = [];
exports.default = list;


if (true || _config2.default.development) makeRepo('public', './public');

// let fx = makeRepo('fx', '/Users/omar/code/codex_press/fx');
// fx.on('ready', () => console.log('hiya', fx.inlineAssets));

var parent = makeRepo('parent', '/Users/omar/code/codex_press/parent');
var app = makeRepo('app', '/Users/omar/code/codex_press/app');
var render = makeRepo('render', '/Users/omar/code/codex_press/render');
// let codex = makeRepo('codex', '/Users/omar/code/codex_press/codex');
// parent.on('ready', () => console.log('hiya', parent.assets));


function makeRepo(name, path) {
  var repo = new _repository2.default({ name: name, path: path });

  repo.on('update', function (e) {
    // console.log(`--${ e.type }: ${ e.filename }`);
    (0, _socket.broadcast)(e.filename);
  });

  list.push(repo);

  return repo;
}

function getRepo(assetPath) {
  var repoName = assetPath.match(/(.+?)[./]/)[1];
  return list.find(function (r) {
    return r.name === repoName;
  });
}

function getFileList() {
  return list.reduce(function (list, r) {
    list[r.name] = { assets: r.assets, inlineAssets: r.inlineAssets };
    return list;
  }, {});
}