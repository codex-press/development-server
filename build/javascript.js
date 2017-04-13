'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fsPromise = require('fs-promise');

var _fsPromise2 = _interopRequireDefault(_fsPromise);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _browserifyIncremental = require('browserify-incremental');

var _browserifyIncremental2 = _interopRequireDefault(_browserifyIncremental);

var _filesystem = require('./filesystem');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var reposDir = '/Users/omar/code/codex_press';

var browserifiers = {};

exports.default = function (req, res, next) {
  res.setHeader('content-type', 'application/javascript');

  var assetPath = req.path.slice(1);
  var filename = void 0;

  (0, _filesystem.getFilename)('/' + assetPath).then(function (result) {
    filename = result;

    if (/\.js$/.test(filename)) return res.sendFile(filename);

    // dependencies come back with symlinks resolved, so we need real
    // path to this repository
    var repo = assetPath.match(RegExp('(.*?)[/.]'))[1];
    var repoPath = _path2.default.join(reposDir, repo);
    var realRepoPath = _fs2.default.realpathSync(repoPath);

    var external = 'app article plugin touch animate collection dom events\
                    log utility env'.split(' ');

    if (!browserifiers[filename]) {

      browserifiers[filename] = (0, _browserifyIncremental2.default)(filename, {
        debug: true,
        extensions: ['.es6']
      }).transform('babelify', { 'presets': ['es2015-loose'] }).external(external);

      browserifiers[filename].on('dep', function (data) {
        if (data.file.indexOf(realRepoPath) === 0) {
          var relative = data.file.slice(realRepoPath.length);
          var dep = _path2.default.join(reposDir, repo, relative);
          _filesystem.dependencyTree[filename] = _filesystem.dependencyTree[filename] || [];
          _filesystem.dependencyTree[filename].push(dep);
        }
      });
    }

    // buffer response so we can send errors properly
    var code = '';
    return new Promise(function (resolve, reject) {
      browserifiers[filename].bundle().on('error', function (error) {
        return reject(error);
      }).on('data', function (data) {
        return code += data;
      }).on('end', function () {
        return res.send(code);
      });
    }).catch(function (error) {

      console.log(error);

      // sends to console
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
  }).catch(next);
};