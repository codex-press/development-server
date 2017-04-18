'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendAsset = sendAsset;
exports.sendInline = sendInline;
exports.sendHTML = sendHTML;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _repository_list = require('./repository_list');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sendAsset(req, res, next) {
  var assetPath = req.path.slice(1);
  var repo = (0, _repository_list.getRepo)(assetPath);

  if (!repo.has(assetPath)) return next();

  if (/\.js/.test(req.path)) res.setHeader('Content-Type', 'application/javascript');else if (/\.css/.test(req.path)) res.setHeader('Content-Type', 'text/css');

  console.log('serving: ' + _path2.default.join(repo.name, repo.filename(assetPath)));

  repo.code(assetPath).then(function (code) {
    return res.send(code);
  }).catch(function (error) {
    // send it to the socket

    res.send('error!');
  });
}

function sendInline(req, res, next) {
  var repo = (0, _repository_list.getRepo)(req.path);

  if (repo.has(req.path)) res.sendFile(repo.file(req.path));else next();
}

function sendHTML(req, res) {
  var data = { appOrigin: '', renderOrigin: '' };

  var contentOrigin = 'https://usercontent.codex.press';
  var csp = ('\n    default-src  \'none\';\n    connect-src  \'self\' ' + contentOrigin + ' https://performance.typekit.net\n                 ws://' + req.get('Host') + ';\n    script-src   \'unsafe-eval\' \'self\' ' + contentOrigin + ' https://use.typekit.net;\n    style-src    \'unsafe-inline\' \'self\' ' + contentOrigin + '\n                 https://use.typekit.net https://fonts.googleapis.com;\n    font-src     data: \'self\' ' + contentOrigin + ' \n                 https://use.typekit.net https://fonts.gstatic.com;\n    img-src      blob: data: \'self\' ' + contentOrigin + ' https://p.typekit.net;\n    media-src    blob: ' + contentOrigin + ';\n  ').replace(/\s+/g, ' ');

  res.setHeader('Content-Security-Policy', csp);
  res.render('index.pug', data);
}