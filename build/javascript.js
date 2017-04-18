'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transpileJavascript;

var _fsPromise = require('fs-promise');

var _fsPromise2 = _interopRequireDefault(_fsPromise);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _browserifyIncremental = require('browserify-incremental');

var _browserifyIncremental2 = _interopRequireDefault(_browserifyIncremental);

var _moduleDeps = require('module-deps');

var _moduleDeps2 = _interopRequireDefault(_moduleDeps);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var compilers = {};

function transpileJavascript(filename, directory, assetPath) {
  var fullPath = _path2.default.join(directory, filename);

  if (!compilers[fullPath]) compilers[fullPath] = createCompiler(filename, directory, assetPath);

  return findExternal(filename, directory).then(function (external) {

    var code = '';
    return new Promise(function (resolve, reject) {
      compilers[fullPath].external(external).bundle().on('error', function (error) {
        console.log('here!', error);reject(error);
      }).on('data', function (data) {
        return code += data;
      }).on('end', function () {
        return resolve(code);
      });
    });
  }).catch(function (error) {

    console.error(error);

    // send to browser console
    res.send('console.error("' + error.message + '");');

    if (error._babel) {
      throw {
        type: 'JavaScript',
        filename: filename,
        message: error.message,
        line: error.loc.line,
        column: error.loc.column,
        // removes ANSI color escapes
        extract: error.codeFrame.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
      };
    } else {
      throw {
        type: 'Syntax',
        filename: filename,
        message: error.message
      };
    }
  });
}

function createCompiler(filename, directory, assetPath) {
  return (0, _browserifyIncremental2.default)(filename, { basedir: directory, debug: true }).transform('babelify', { 'presets': ['es2015'] }).require(_path2.default.join(directory, filename), { expose: '/' + assetPath });
}

function findExternal(filename, directory) {

  return new Promise(function (resolve, reject) {

    var external = [];

    (0, _moduleDeps2.default)({
      transform: [['babelify', { presets: 'es2015' }]],
      ignoreMissing: true
    }).on('error', function (err) {
      return reject(err);
    }).on('missing', function (id, parent) {
      if (RegExp('^/').test(id)) external.push(id);
    }).on('file', function (path, relative) {
      if (path.indexOf(directory) !== 0) throw 'Bad import: ' + relative;
    }).on('data', function () {}).on('end', function () {
      return resolve(external);
    }).end({ file: _path2.default.join(directory, filename) });
  });
}