'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = processCSS;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsPromise = require('fs-promise');

var _fsPromise2 = _interopRequireDefault(_fsPromise);

var _less = require('less');

var _less2 = _interopRequireDefault(_less);

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function processCSS(filename, directory) {

  if (/\.css$/.test(filename)) {
    return _fsPromise2.default.readFile(_path2.default.join(directory, filename), { encoding: 'utf8' }).then(function (css) {
      return (0, _postcss2.default)([_autoprefixer2.default]).process(css);
    }).then(function (out) {
      res.setHeader('content-type', 'text/css');
      res.send(out.css);
    });
  } else if (/\.less$/.test(filename)) {
    var _ret = function () {

      var dependencies = [];

      var opts = {
        filename: _path2.default.join(directory, filename),
        strictMath: true,
        strictUnits: true,
        sourceMap: {
          outputSourceFiles: true,
          sourceMapFileInline: true
        }
      };

      return {
        v: _fsPromise2.default.readFile(_path2.default.join(directory, filename), 'utf8').then(function (out) {
          return _less2.default.render(out, opts);
        }).then(function (out) {
          dependencies = out.imports;
          return (0, _postcss2.default)([_autoprefixer2.default]).process(out.css);
        }).then(function (out) {
          return { dependencies: dependencies, code: out.css };
        }).catch(function (error) {
          console.log(error);

          throw {
            filename: filename,
            type: error.type,
            message: error.message,
            line: error.line,
            column: error.index,
            extract: error.extract ? error.extract.join('\n') : ''
          };
        })
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  }
}