import path from 'path';
import chalk from 'chalk';

import { getRepo } from './repository_list';
import { broadcast } from './socket';



export function sendAsset(req, res, next) {
  let assetPath = req.path.slice(1);
  let repo = getRepo(assetPath);

  if (!repo || !repo.has(assetPath))
    return next();

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

  if (repo && repo.hasInline(name))
    res.sendFile(repo.inlineFilename(name));
  else
    next();
}


export function sendHTML(req, res) {
  let contentOrigin = 'https://usercontent.codex.press';
  let devOrigin = 'http://localhost';

  let csp = (`
    default-src  'none';
    connect-src  'self' ${ devOrigin } ${ contentOrigin }
                 https://performance.typekit.net ws://${ req.get('Host') };
    script-src   'unsafe-eval' 'self' ${ devOrigin } ${ contentOrigin }
                 https://use.typekit.net;
    style-src    'unsafe-inline' 'self' ${ devOrigin } ${ contentOrigin }
                 https://use.typekit.net https://fonts.googleapis.com;
    font-src     data: 'self' ${ devOrigin } ${ contentOrigin } 
                 https://use.typekit.net https://fonts.gstatic.com;
    img-src      blob: data: 'self' ${ contentOrigin } https://p.typekit.net;
    media-src    blob: ${ contentOrigin };
  `).replace(/\s+/g,' ');

  res.setHeader('Content-Security-Policy', csp);
  res.render('index.pug');
}


