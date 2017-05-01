'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _fsPromise = require('fs-promise');

var _fsPromise2 = _interopRequireDefault(_fsPromise);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _javascript = require('./javascript');

var _javascript2 = _interopRequireDefault(_javascript);

var _css = require('./css');

var _css2 = _interopRequireDefault(_css);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// windows backslash nightmare
var sep = _path2.default.sep === '\\' ? '\\\\' : '/';

var Repository = function (_EventEmitter) {
  _inherits(Repository, _EventEmitter);

  function Repository(_ref) {
    var name = _ref.name;
    var path = _ref.path;

    _classCallCheck(this, Repository);

    var _this = _possibleConstructorReturn(this, (Repository.__proto__ || Object.getPrototypeOf(Repository)).call(this));

    _this.name = name;
    _this.path = path;

    _this.files = [];
    _this.external = {};
    _this.inline = {};
    _this.dependencies = {};

    _this.loadConfig();
    _this.watch();

    // promise to the point when all the files are found by chokidar
    _this.ready = new Promise(function (resolve) {
      return _this._resolve = resolve;
    });
    return _this;
  }

  _createClass(Repository, [{
    key: 'loadConfig',
    value: function loadConfig() {
      try {
        this.config = JSON.parse(_fs2.default.readFileSync(this.path + '/package.json')).codex;
      } catch (e) {
        if (e.code !== 'ENOENT') console.error(e);
      }

      this.config = this.config || { 'babel': ['*.js'] };
    }
  }, {
    key: 'has',
    value: function has(assetPath) {
      return !!this.external[assetPath];
    }
  }, {
    key: 'hasInline',
    value: function hasInline(assetPath) {
      return !!this.external[assetPath];
    }
  }, {
    key: 'getMeta',
    value: function getMeta(assetPath) {
      return {
        noParse: true
      };
    }
  }, {
    key: 'code',
    value: function code(assetPath) {
      var _this2 = this;

      var asset = this.external[assetPath];

      if (!asset) return Promise.resolve('not found!');

      // use options to see if it should be transpiled at all...
      // might just read the file with fs-promise

      var config = this.getMeta(assetPath);

      if (/\.js/.test(assetPath) && config.noParse) return _fsPromise2.default.readFile(_path2.default.join(this.path, asset.filename));else if (/\.js/.test(assetPath)) {
        return (0, _javascript2.default)(asset.filename, this.path, assetPath).then(function (_ref2) {
          var dependencies = _ref2.dependencies;
          var code = _ref2.code;

          _this2.dependencies[assetPath] = dependencies;
          return code;
        });
      } else if (/\.css/.test(assetPath)) {
        return (0, _css2.default)(asset.filename, this.path, assetPath).then(function (_ref3) {
          var dependencies = _ref3.dependencies;
          var code = _ref3.code;

          _this2.dependencies[assetPath] = dependencies;
          return code;
        });
      }
    }
  }, {
    key: 'filename',
    value: function filename(assetPath) {
      return this.external[assetPath].filename;
    }
  }, {
    key: 'inlineFilename',
    value: function inlineFilename(assetPath) {
      return this.inlieAssets[assetPath].filename;
    }
  }, {
    key: 'close',
    value: function close() {
      this.watcher.close();
    }
  }, {
    key: 'watch',
    value: function watch() {
      var _this3 = this;

      var ignored = /node_modules|(^|[\/\\])\../;
      var path = this.path + '/**/*@(js|css|less|svg|html|woff|woff2|ttf|json)';
      this.watcher = _chokidar2.default.watch(path, { ignored: ignored }).on('error', function () {
        return console.log('error', _this3.name);
      }).on('add', function (path) {
        return _this3.add(path);
      }).on('ready', function () {
        return _this3._resolve();
      }).on('change', function (path) {
        return _this3.change(path);
      }).on('unlink', function (path) {
        return _this3.remove(path);
      });
    }
  }, {
    key: 'change',
    value: function change(filename) {
      filename = filename.slice(this.path.length + 1);

      if (filename === 'package.json') {
        this.loadConfig();
        return;
      }
      // ignore other .json files. unfortunately there's a bug in chokidar where
      // it will never file 'ready' if you give it an array of paths or add one
      // later :/
      else if (/.json$/.test(filename)) {
          return;
        }

      // XXX use dependency tree to get all assetPaths being updated

      this.emit('update', { change: [filename] });
    }
  }, {
    key: 'remove',
    value: function remove(filename) {

      // XXX use dependency tree to get all assetPaths being updated

      this.emit('update', { remove: [filename] });
    }
  }, {
    key: 'add',
    value: function add(filename) {
      filename = filename.slice(this.path.length + 1);

      console.log(this.name, filename);

      if (filename !== 'package.json') this.files.push({ filename: filename });

      var assetPath = this.assetPath(filename);
      if (assetPath) {
        this.external[assetPath] = { assetPath: assetPath, filename: filename };
      }

      var inlinePath = this.inlineAssetPath(filename);
      if (inlinePath) {
        this.inline[inlinePath] = { assetPath: inlinePath, filename: filename };
      }

      // XXX would be nice to keep track of missing files in the dependency
      // tree and update as well

      this.emit('update', { add: [filename] });
    }
  }, {
    key: 'assetPath',
    value: function assetPath(filename) {
      var cssRE = /(.*?)(\.css|\.less|[/\\]?index\.css|[/\\]?index\.less)$/;
      var jsRE = /(.*?)(\.js|\/?index\.dev\.js|\/?index\.js)$/;

      var assetPath = '';
      if (cssRE.test(filename)) assetPath = filename.match(cssRE)[1] + '.css';else if (jsRE.test(filename)) assetPath = filename.match(jsRE)[1] + '.js';else return null;

      if (assetPath[0] !== '.') assetPath = '/' + assetPath;

      // Windows backslash nightmare
      return this.name + assetPath.replace(RegExp(sep, 'g'), '/');
    }
  }, {
    key: 'inlineAssetPath',
    value: function inlineAssetPath(filename) {
      var re = /(.*?)\.(svg|html|js)/;

      if (re.test(filename)) return _path2.default.join(this.name, filename);
    }
  }]);

  return Repository;
}(_events2.default);

exports.default = Repository;