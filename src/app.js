import portfinder from 'portfinder';
import express from 'express';
import http from 'http';
import path from 'path';
import open from 'open';
import morgan from 'morgan';

import api from './api';
import config from './config';
import repos, { updateRepoList } from './repository_list';
import socket from './socket';

import { sendAsset, sendHTML, sendInline } from './routes';


updateRepoList();

const app = express();
app.set('view engine', 'pug')

const server = http.createServer(app);
socket(server);


// middleware
app.use(morgan('tiny'));
app.use(express.static('public'));
app.use('/api', api);


// routes
app.get('inline', sendInline);
app.get('*.(js|css)', sendAsset);
app.get(/^[^.]*$/, sendHTML);


portfinder.getPort((err, port) => {

  server.listen(port, () => console.log('listening ' + port));

  // this when run from command line as NPM package
  if (/bin\/main\.js$/.test(require.main.filename))
    open(`http://localhost:${port}/`);

});


