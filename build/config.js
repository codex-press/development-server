'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = exports.default = undefined;
exports.writeConfig = writeConfig;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = readConfig() || {};

exports.default = config;
var version = exports.version = require('../package.json').version;

function writeConfig(newConfig) {
  exports.default = config = newConfig;
  _mkdirp2.default.sync(_path2.default.dirname(configPath()));
  _fs2.default.writeFileSync(configPath(), JSON.stringify(config), "utf8");
}

function readConfig() {
  try {
    return JSON.parse(_fs2.default.readFileSync(configPath()));
  } catch (e) {
    return {};
  }
}

// https://medium.com/@ccnokes/how-to-store-user-data-in-electron-3ba6bf66bc1e#.x725pogpf
function configPath() {
  switch (_os2.default.type()) {
    case 'Darwin':
      return _os2.default.homedir() + '/Library/Application Support/Codex Press/development_server.json';
    case 'Windows_NT':
      return _os2.default.homedir() + '\\AppData\\Local\\Codex Press\\development_server.json';
    case 'Linux':
      return _os2.default.homedir() + '/.config/codex/development_server.json';
  }
}