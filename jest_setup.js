
process.removeAllListeners('unhandledRejection');
process.on('unhandledRejection', reason => console.log(reason));

const config = require('./src/server/config');

const version = require('./package.json').version;
const path = require('path');

const fetch = require('node-fetch');
global.fetch = (url, ...rest) => {
  if (url[0] === '/')
    return fetch('http://0.0.0.0' + url, ...rest)
  else
    return fetch(url, ...rest)
}

process.env.UNLAZY = true;

Object.assign(config.default, {
  version,
  token: null,
  repositories: {
    test: {
      path: path.resolve(__dirname, 'test/fixtures/repository'),
      name: 'test',
    }
  },
  disable_csp: false,
  domain: '',
});


