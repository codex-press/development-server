import path from 'path';
import chalk from 'chalk';

import { getRepo } from './repository_list';
import { broadcast } from './socket';


export function sendAsset(req, res, next) {

  // serves js/css for dev server
  if (/\/main\.(js|css)/.test(req.path))
    return res.sendFile(path.resolve(__dirname + '/..') + req.path);

  let assetPath = req.path.slice(1);
  let repo = getRepo(assetPath);

  if (!repo || !repo.has(assetPath))
    return next();

  // required for using this to serve assets for Codex server in development
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (/\.js/.test(req.path))
    res.setHeader('Content-Type', 'application/javascript');
  else if (/\.css/.test(req.path)) 
    res.setHeader('Content-Type', 'text/css');

  let filename = path.join(repo.name, repo.filename(assetPath));
  console.log(chalk.cyan(`serving: ${filename}`));

  repo.code(assetPath)
  .then(code => res.send(code))
  .catch(error => res.send(`console.error("${error.message}");`));
}


export function sendInline(req, res, next) {
  let name = req.path.slice(1);
  let repo = getRepo(name);

  if (repo && repo.hasInline(name)) {
    let filename = repo.inlineFilename(name);
    console.log(chalk.cyan(`serving: ${ filename }`));
    res.sendFile(filename);
  }
  else
    next();
}


export function sendHTML(req, res) {
  let contentOrigin = 'https://usercontent.codex.press';
  let devOrigin = 'http://localhost';

  let script = '/main.js';
  let webpack = '';
  let webpackWS = '';

  if (process.env.CP_ENV === 'development') {
    script = 'http://localhost:8001/main.js';
    webpack = 'http://localhost:8001/';
    webpackWS = 'ws://localhost:8001/';
  }

  let csp = (`
    default-src  'none';
    connect-src  'self' ${ webpack } ${ webpackWS } ${ devOrigin }
                 ${ contentOrigin } ws://${ req.get('Host') }
                 https://performance.typekit.net;
    script-src   'unsafe-eval' 'self' ${ webpack } ${ devOrigin }
                 ${ contentOrigin } https://use.typekit.net;
    style-src    'unsafe-inline' 'self' ${ devOrigin } ${ contentOrigin }
                 https://use.typekit.net https://fonts.googleapis.com;
    font-src     data: 'self' ${ devOrigin } ${ contentOrigin } 
                 https://use.typekit.net https://fonts.gstatic.com;
    img-src      blob: data: 'self' ${ contentOrigin } https://p.typekit.net;
    media-src    blob: ${ contentOrigin };
  `).replace(/\s+/g,' ');

  res.setHeader('Content-Security-Policy', csp);
  res.render('index.pug', { script });
}


