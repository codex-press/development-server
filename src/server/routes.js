import path from 'path';
import chalk from 'chalk';
import uaParser from 'ua-parser-js';
import url from 'url';

import config from './config';
import { getRepo } from './repository_list';
import { broadcast } from './socket';


export async function sendAsset(req, res, next) {

  if (req.path === '/dev-server.js')
    return res.sendFile(path.join(__dirname, '../browser.js'));

  let assetPath = req.path;
  let repo = getRepo(assetPath);

  // required for using this to serve assets for Codex server in development
  if (process.env.CP_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  if (!repo || !repo.has(assetPath))
    return next();

  let filename = path.join(repo.name, repo.findFilename(assetPath));
  console.log(chalk.cyan(`serving: /${ filename }`));

  let useModules = (
    req.get('referrer') &&
    'modules' in url.parse(req.get('referrer'), true).query
  );

  let ext = path.extname(req.path).slice(1);

  try {
    let code = await repo.code(assetPath, { useModules })

    if ('js' === ext)
      res.setHeader('Content-Type', 'application/javascript');
    else if ('css' === ext) 
      res.setHeader('Content-Type', 'text/css');

    res.send(code);
  }
  catch (error) {
    console.log(error)
    if ('js' === ext) {
      res.setHeader('Content-Type', 'application/javascript');
      let message = error.message.replace(/"/g, '\\"');
      res.send(`console.error("${ message }");`)
    }
    else {
      res.send(error.message);
    }
  }

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
  let env = 'production';
  let contentOrigin = 'https://usercontent.staging.codex.press';
  let codexOrigin = 'https://staging.codex.press';
  let apiOrigin = 'http://staging.codex.press/api';

  let script = '/dev-server.js';
  let webpack = '';
  let webpackWS = '';

  if (process.env.NODE_ENV === 'development') {
    env = 'development';
    contentOrigin = 'http://localhost';
    codexOrigin = 'http://localhost';
    apiOrigin = 'http://api.dev';

    script = 'http://localhost:8001/main.js';
    webpack = 'http://localhost:8001/';
    webpackWS = 'ws://localhost:8001/';
  }

  let csp = (`
    default-src  'none';
    connect-src  'self' ${ webpack } ${ webpackWS } ${ apiOrigin }
                 ${ codexOrigin } ws://${ req.get('Host') }
                 https://performance.typekit.net;
    script-src   'unsafe-eval' 'self' ${ webpack } ${ apiOrigin }
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

  const data = { script, contentOrigin, codexOrigin, apiOrigin, env };
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

