import express from 'express';
import http from 'http';
import path from 'path';
import opn from 'opn';

import api from './api';
import config from './config';
import socket from './socket';

import sendCSS from './css';
import sendHTML from './html';
import sendJavaScript from './javascript';
import sendInlineAsset from './inline';

const app = express();
const server = http.createServer(app);

socket(server);


app.set('view engine', 'pug')

app.use(express.static('public'));

app.use('/api', api);

app.get(/^[^.]*$/, sendHTML);

app.get(/\.css$/, sendCSS);
app.get(/\.js$/, sendJavaScript);
app.get(/\.(html|svg|ttf|woff)$/, sendInlineAsset);

server.listen(config.port, () => console.log('listening ' + config.port));

// this when run from command line as NPM package

if (!config.development)
  opn(`http://localhost:${config.port}/`);


