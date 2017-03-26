'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var api = (0, _express2.default)();
exports.default = api;


api.use(_bodyParser2.default.json());

api.post('/config', function (req, res) {
  console.log(req.body);
  res.json(_config2.default);
});

api.get('/config', function (req, res) {
  res.json(_config2.default);
});