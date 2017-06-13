import portfinder from 'portfinder';
import express from 'express';
import http from 'http';
import path from 'path';
import open from 'open';
import morgan from 'morgan';
import chalk from 'chalk';

import api from './api';
import config from './config';
import repos, { updateRepoList } from './repository_list';
import socket from './socket';

import { sendAsset, sendHTML, sendInline } from './routes';

updateRepoList();

const app = express();
app.set('views', path.join(__dirname, '../../src/views'));
app.set('view engine', 'pug')

const server = http.createServer(app);
socket(server);


// middleware
app.use(morgan('tiny'));
app.use('/api', api);


// routes
app.get('*.(js|css|html|svg)', sendAsset);
app.get(/^[^.]*$/, sendHTML);

let basePort = (process.env.CP_PORT * 1) || 8000;
portfinder.basePort = basePort;
portfinder.getPort((err, port) => {

  server.listen(port, () => {
    if (port !== basePort)
      console.log(chalk.magenta(
        `Port ${ basePort } is not available, listening on ${ port }`
      ));
    else
      console.log(chalk.magenta(`Listening on port ${ port }`));
  });

  // this when run from command line as NPM package
  if (process.env.CP_OPEN === 'true')
    open(`http://localhost:${port}/`);
});


