'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = {};

exports.default = config;


var appName = 'codex';
var appDataPath = '.';
var system = _os2.default.type();

if (system === 'Darwin') appDataPath = '~/Library/Application Support/' + appName + '/';else if (system === 'Windows_NT') appDataPath = 'C:\\Users\\' + process.env.USER + '\\AppData\\Local\\' + appName + '/';else if (system === 'Windows_NT') appDataPath = '~/.config/' + appName + '/';

// // And then, to read it...
// myJson = require("./filename.json");

// fs.writeFile( "filename.json", JSON.stringify( myJson ), "utf8", yourCallback );


// https://medium.com/@ccnokes/how-to-store-user-data-in-electron-3ba6bf66bc1e#.x725pogpf


exports.default = config = Object.assign({
  port: 8000
}, config);

// will need to somehow set in GULP ?
config.development = true;