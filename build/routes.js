'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendAsset = sendAsset;
exports.sendInline = sendInline;
exports.sendHTML = sendHTML;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _repository_list = require('./repository_list');

var _socket = require('./socket');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sendAsset(req, res, next) {
  var assetPath = req.path.slice(1);
  var repo = (0, _repository_list.getRepo)(assetPath);

  if (!repo || !repo.has(assetPath)) return next();

  if (/\.js/.test(req.path)) res.setHeader('Content-Type', 'application/javascript');else if (/\.css/.test(req.path)) res.setHeader('Content-Type', 'text/css');

  var filename = _path2.default.join(repo.name, repo.filename(assetPath));
  console.log(_chalk2.default.cyan('serving: ' + filename));

  repo.code(assetPath).then(function (code) {
    return res.send(code);
  }).catch(function (error) {
    return res.send('console.error("' + error.message + '");');
  });
}

function sendInline(req, res, next) {
  var name = req.path.slice(1);
  var repo = (0, _repository_list.getRepo)(name);

  if (repo && repo.hasInline(name)) res.sendFile(repo.inlineFilename(name));else next();
}

function sendHTML(req, res) {
  var contentOrigin = 'https://usercontent.codex.press';
  var devOrigin = 'http://localhost';

  var csp = ('\n    default-src  \'none\';\n    connect-src  \'self\' ' + devOrigin + ' ' + contentOrigin + '\n                 https://performance.typekit.net ws://' + req.get('Host') + ';\n    script-src   \'unsafe-eval\' \'self\' ' + devOrigin + ' ' + contentOrigin + '\n                 https://use.typekit.net;\n    style-src    \'unsafe-inline\' \'self\' ' + devOrigin + ' ' + contentOrigin + '\n                 https://use.typekit.net https://fonts.googleapis.com;\n    font-src     data: \'self\' ' + devOrigin + ' ' + contentOrigin + ' \n                 https://use.typekit.net https://fonts.gstatic.com;\n    img-src      blob: data: \'self\' ' + contentOrigin + ' https://p.typekit.net;\n    media-src    blob: ' + contentOrigin + ';\n  ').replace(/\s+/g, ' ');

  res.setHeader('Content-Security-Policy', csp);
  res.render('index.pug');
}