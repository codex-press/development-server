import portfinder from 'portfinder';
import express from 'express';
import http from 'http';
import path from 'path';
import open from 'open';
import morgan from 'morgan';

import api from './api';
import config from './config';
import repos from './repository_list';
import socket from './socket';

import { sendAsset, sendHTML, sendInline } from './routes';

const app = express();
const server = http.createServer(app);

socket(server);
app.set('view engine', 'pug')

app.use(morgan('tiny'));
app.use(express.static('public'));
app.use('/api', api);

app.get('inline', sendInline);
app.get('*.(js|css)', sendAsset);
app.get(/^[^.]*$/, sendHTML);


// find an open port
portfinder.getPort((err, port) => {
  let hostname = '127.0.0.1';
  server.listen(port, hostname, () => console.log('listening ' + port));

  // this when run from command line as NPM package
  if (/bin\/main\.js$/.test(require.main.filename))
    open(`http://localhost:${port}/`);
});

