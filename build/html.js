'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (req, res) {
  var data = { appOrigin: '', renderOrigin: '' };
  res.render('index.pug', data);
};