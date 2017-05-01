'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isLocalhost = isLocalhost;
function isLocalhost(req) {
  return !!['::ffff:127.0.0.1', '::1', '127.0.0.1'].find(function (ip) {
    return ip == req.ip;
  });
}