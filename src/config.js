import fs from 'fs';
import os from 'os';

var config = {}

export {config as default};

let appName = 'codex';
let appDataPath = '.';
let system = os.type();

if (system === 'Darwin')
  appDataPath = `~/Library/Application Support/${appName}/`;
else if (system === 'Windows_NT')
  appDataPath = `C:\\Users\\${ process.env.USER }\\AppData\\Local\\${appName}/`;
else if (system === 'Windows_NT')
  appDataPath = `~/.config/${appName}/`;

// // And then, to read it...
// myJson = require("./filename.json");

// fs.writeFile( "filename.json", JSON.stringify( myJson ), "utf8", yourCallback );


// https://medium.com/@ccnokes/how-to-store-user-data-in-electron-3ba6bf66bc1e#.x725pogpf


config = Object.assign({
  port        : 8000,
}, config);

// will need to somehow set in GULP ?
config.development = true;

