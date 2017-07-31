import 'regenerator-runtime/runtime';
import portfinder from 'portfinder';
import express from 'express';
import http from 'http';
import path from 'path';
import open from 'open';

import * as log from './log';
import api from './api';
import config from './config';
import { updateRepositories, printRepositories } from './repository_collection';
import socket from './socket';
import * as routes from './routes';
import * as env from './env';

updateRepositories();
printRepositories();

process.on('unhandledRejection', reason => console.log(reason));

const app = express()
export { app as default }
app.set('views', path.join(__dirname, '../../src/views'))
app.set('view engine', 'pug')

const server = http.createServer(app);
socket(server);

app.use('/api', api);
app.get('*.(js|css|map|html|svg|ttf|woff|woff2)', routes.sendAsset);
app.get('*', routes.sendHTML);

export var port;
let basePort = (process.env.CP_PORT * 1) || 8000;
portfinder.basePort = basePort;

export var listening = new Promise(resolve => {

  portfinder.getPort((err, foundPort) => {
    port = foundPort

    server.listen(port, () => {
      if (port !== basePort)
        log.magenta(`Port ${ basePort } is not available, listening on ${ port }`)
      else
        log.magenta(`Listening on port ${ port }`)
    })

    // this when run from command line as NPM package
    if (process.env.CP_OPEN === 'true')
      open(`http://localhost:${port}/`)

    resolve(port)
  })

})

