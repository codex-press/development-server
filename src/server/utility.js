
export function isLocalhost(req) {
  return ['::ffff:127.0.0.1', '::1', '127.0.0.1'].includes(req.ip);
}


