'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _filesystem = require('./filesystem');

exports.default = function (req, res, next) {

  (0, _filesystem.getFilename)(req.path).then(function (filename) {
    if (filename) res.sendFile(filename);else next();
  }).catch(function (err) {
    return next();
  });
};