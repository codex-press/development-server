import fs from 'fs';
import os from 'os';
import path from 'path';
import mkdirp from 'mkdirp';

import * as env from './env';

const version = require('../../package.json').version;

var config = readConfig();
export { config as default };


export function writeConfig(newConfig) {

  config = {
    version,
    token: newConfig.token,
    repositories: newConfig.repositories || {},
    disable_csp: newConfig.disable_csp || false,
    domain: newConfig.domain || '',
  };

  mkdirp.sync(path.dirname(configPath()));
  fs.writeFileSync(configPath(), JSON.stringify(config), "utf8");
}


function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath()));
  }
  catch (e) {
    return {
      version,
      token: null,
      repositories: {},
      disable_csp: false,
      domain: '',
    };
  }
}


// https://medium.com/@ccnokes/how-to-store-user-data-in-electron-3ba6bf66bc1e#.x725pogpf
function configPath() {
  switch (os.type()) {
    case 'Darwin':
      return (
        os.homedir() +
        '/Library/Application Support/Codex Press/development_server.json'
      );
    case 'Windows_NT':
      return (
        os.homedir() +
        '\\AppData\\Local\\Codex Press\\development_server.json'
      );
    case 'Linux':
      return os.homedir() + '/.config/codex/development_server.json';
  }
}



