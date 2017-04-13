'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dependencyTree = undefined;
exports.getFilename = getFilename;

var _fsPromise = require('fs-promise');

var _fsPromise2 = _interopRequireDefault(_fsPromise);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _socket = require('./socket');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dependencyTree = exports.dependencyTree = {};

// windows backsalsh nightmare
var sep = _path2.default.sep === '\\' ? '\\\\' : '/';

var reposDir = '/Users/omar/code/codex_press';

function getFilename(assetPath) {

  return new Promise(function (resolve, reject) {
    var basename = reposDir + assetPath.match(/(.*)\..*/)[1];

    function recurse(exts) {
      return _fsPromise2.default.stat(basename + exts[0]).then(function (s) {
        return resolve(basename + exts[0]);
      }).catch(function (e) {
        return exts.length > 1 ? recurse(exts.slice(1)) : reject(e);
      });
    };

    if (/\.js$/.test(assetPath)) recurse(('.dev.js ' + sep + 'index.dev.js .js ' + sep + 'index.js .es6 ' + sep + 'index.es6').split(' '));else if (/\.css$/.test(assetPath)) recurse(('.css .less ' + sep + 'index.css ' + sep + 'index.less').split(' '));else {
      return _fsPromise2.default.stat(reposDir + assetPath).then(function (s) {
        return resolve(reposDir + assetPath);
      }).catch(function (e) {
        return reject(e);
      });
    }
  }).catch(function (error) {
    throw {
      type: 'Not Found',
      message: 'Asset not found: ' + assetPath
    };
  });
};

var watcher = _chokidar2.default.watch('./public');

watcher.on('all', function (event, filename) {
  (0, _socket.broadcast)(filename);
});

function getUrl(filename) {
  var cssRegEx = RegExp('' + reposDir + sep + '(.*?)(\\.css|\\.less|' + sep + 'index\\.css|' + sep + 'index\\.less)$');
  var jsRegEx = RegExp('' + reposDir + sep + '(.*?)(\\.js|\\.es6|' + sep + 'index\\.dev\\.js|' + sep + 'index\\.js|' + sep + 'index\\.es6)$');

  var urlPath = '';
  if (filename.match(cssRegEx)) urlPath = filename.match(cssRegEx)[1] + '.css';else if (filename.match(jsRegEx)) urlPath = filename.match(jsRegEx)[1] + '.js';

  // Windows backslash nightmare
  return urlPath.replace(RegExp(sep, 'g'), '/');
};

function fileRemove(filename) {
  console.log('removed: ', filename);
  var repo = filename.match(RegExp('^' + reposDir + sep + '(.*?)' + sep))[1];
  var url = getUrl(filename);
  if (url) {
    var i = fileList[repo].findIndex(function (u) {
      return u == url;
    });
    if (i >= 0) {
      fileList[repo].splice(i, 1);
      (0, _socket.broadcast)({ fileList: fileList });
    }
  }

  // since getUrl for es6 file retuns .js this needs to be separate
  var inlineRegEx = RegExp('' + reposDir + sep + '(.*?\\.(svg|es6|hbs))');
  if (inlineRegEx.test(filename)) {
    var assetPath = filename.match(inlineRegEx)[1];
    assetPath = assetPath.replace(RegExp(sep, 'g'), '/');
    var _i = fileList[repo].findIndex(function (u) {
      return u == url;
    });
    fileList[repo].splice(_i, 1);
    (0, _socket.broadcast)({ fileList: fileList });
  }
};

function fileAdd(filename) {
  console.log('watching: ', filename);
  var regex = RegExp('^' + reposDir + sep + '(.*?)' + sep);
  var repo = filename.match(regex)[1];
  fileList[repo] = fileList[repo] || [];
  var url = getUrl(filename);
  if (url) {
    if (!fileList[repo].find(function (u) {
      return u == url;
    })) {
      fileList[repo].push(url);
      (0, _socket.broadcast)({ fileList: fileList });
    }
  }

  // since getUrl for es6 file retuns .js this needs to be separate
  var inlineRegex = RegExp('' + reposDir + sep + '(.*?\\.(svg|es6|hbs))');
  if (inlineRegex.test(filename)) {
    var assetPath = filename.match(inlineRegex)[1];
    assetPath = assetPath.replace(RegExp(sep, 'g'), '/');
    fileList[repo].push(assetPath);
    (0, _socket.broadcast)({ fileList: fileList });
  }
};

function fileChange(filename) {
  console.log('change: ', filename);

  // search in dependencyTree for all files that depend on this one
  var filenames = Object.keys(dependencyTree).filter(function (f) {
    return dependencyTree[f].indexOf(filename) >= 0;
  });
  filenames.push(filename);

  // send self if it's an inline asset
  if (/\.(svg|hbs|es6)$/.test(filename)) {
    var assetPath = filename.slice(reposDir.length + 1);
    assetPath = assetPath.replace(RegExp(sep, 'g'), '/');
    (0, _socket.broadcast)({ fileList: fileList, assetPath: assetPath });
  }

  // send dependents
  filenames.map(function (filename) {
    console.log('sending update: ', getUrl(filename));
    (0, _socket.broadcast)({ fileList: fileList, assetPath: getUrl(filename) });
  });
}