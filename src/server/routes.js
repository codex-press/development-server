import path from 'path';
import https from 'https';
import uaParser from 'ua-parser-js';
import url from 'url';
import NodeCache from 'node-cache';

import * as log from './log';
import * as env from './env';
import config from './config';
import { port } from './app';
import { getRepo } from './repository_collection';
import { broadcast } from './socket';


export async function sendAsset(req, res, next) {

  if (req.path === '/dev-server.js')
    return res.sendFile(path.join(__dirname, '../browser.js'));

  let repo = getRepo(req.path);

  // required for using this to serve assets for Codex server in development
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  if (!repo)
    return proxyAsset(req, res);

  let filename = repo.findFilename(req.path);

  if (!filename) {
    log.error('Not found ' + req.path);
    return res.sendStatus(404);
  }

  log.info(`serving: /${ repo.name }/${ filename }`);

  let useModules = (
    req.get('referer') &&
    'modules' in url.parse(req.get('referer'), true).query
  );

  let requestText = (
    req.get('Accept') &&
    req.get('Accept').indexOf('text/plain') >= 0
  );

  let ext = path.extname(req.path).slice(1);

  try {
    if (requestText) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.sendFile(path.join(repo.dir, filename));
    }
    else if (ext === 'css') {
      res.setHeader('Content-Type', 'text/css');
      res.send(await repo.code(req.path));
    }
    else if (ext === 'js') {
      res.setHeader('Content-Type', 'application/javascript');
      res.send(await repo.code(req.path, { useModules }));
    }
    else {
      res.sendFile(path.join(repo.dir, filename));
    }
  }
  catch (error) {
    res.status(500).send(error.message);
  }

}




const cache = new NodeCache({ stdTTL: 600 });

export function proxyAsset(req, res) {

  const cached = cache.get(req.path);

  if (cached) {
    // console.log('proxy cached: ' + req.path);
    return res.set(cached.headers).send(cached.body);
  }

  // console.log('proxy: ' + req.path);

  const options = {
    host: url.parse(env.contentOrigin).host,
    path: req.path,
  };

  if (req.get('referer'))
    options.headers = { 'Referer' : req.get('referer') };

  const pipe = codexResponse => {

    const headerNames = [ 
      'etag',
      'content-length',
      'content-type',
      'sourcemap',
      'connection',
    ];

    const headers = Object.keys(codexResponse.headers).reduce((headers, h) => {
      if (headerNames.includes(h)) headers[h] = codexResponse.headers[h];
      return headers;
    }, {});

    res.writeHeader(codexResponse.statusCode, headers);

    let body = '';
    codexResponse.on('data', chunk => body += chunk);


    codexResponse.on('error', error => {
      res.status(500).send(error.message);
      log.error(error); 
    });

    codexResponse.on('end', () => {

      if (codexResponse.statusCode === 200)
        cache.set(req.path, { body, headers });

      res.write(body);
      res.end();
    });
  }

  const sendError = error => {
    res.status(500)
      .send(`Cannot load asset "${ req.path }: ${ error.message }`)
  }

  https.request(options, pipe).on('error', sendError).end();
}



export function sendInline(req, res, next) {
  let name = req.path.slice(1);
  let repo = getRepo(name);

  if (repo && repo.hasInline(name)) {
    let filename = repo.inlineFilename(name);
    log.cyan(`serving: ${ filename }`);
    res.sendFile(filename);
  }
  else
    next();
}



export function sendHTML(req, res) {
  log.yellow(`serving: ${ req.path }`);

  let environment = 'production';
  let contentOrigin = env.contentOrigin;
  let codexOrigin = env.codexOrigin;
  let assetOrigin = req.protocol + '://' + req.hostname + ':' + port;
  let actionCableOrigin = 'wss://' + env.codexHost;

  let script = '/dev-server.js';
  let webpack = '';
  let webpackWS = '';

  if (process.env.NODE_ENV === 'development') {
    environment = 'development';
    actionCableOrigin = 'ws://' + env.codexHost;
    script = 'http://localhost:8001/main.js';
    webpack = 'http://localhost:8001/';
    webpackWS = 'ws://localhost:8001/';
  }

  let csp = (`
    default-src  'none';
    connect-src  'self' ${ webpack } ${ webpackWS } ${ codexOrigin }
                 ws://${ req.get('Host') } ${ actionCableOrigin } 
                 https://performance.typekit.net;
    script-src   'unsafe-eval' 'self' ${ webpack }
                 ${ codexOrigin } ${ contentOrigin } https://use.typekit.net;
    style-src    'unsafe-inline' 'self' ${ codexOrigin } ${ contentOrigin }
                 https://use.typekit.net https://fonts.googleapis.com;
    font-src     data: 'self' ${ contentOrigin } 
                 https://use.typekit.net https://fonts.gstatic.com;
    img-src      blob: data: 'self' ${ contentOrigin } https://p.typekit.net;
    media-src    blob: ${ contentOrigin };
  `).replace(/\s+/g,' ');

  if (!config.disable_csp)
    res.setHeader('Content-Security-Policy', csp);

  const data = {
    script, contentOrigin, codexOrigin, assetOrigin, environment
  };
  res.render('index.pug', data);
}


function browserAcceptsModules(userAgentString) {
  let ua = uaParser(userAgentString);
  let toInt = str => typeof(str) == 'string' ? str.split(".")[0] : 0;

  return (
    (ua.browser.name == 'Safari' && toInt(ua.browser.version) >= 10) ||
    (ua.browser.name == 'Mobile Safari' && toInt(ua.browser.version) >= 10) //||
  );
}

