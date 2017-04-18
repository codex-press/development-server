import path from 'path';

import { getRepo } from './repository_list';


export function sendAsset(req, res, next) {
  let assetPath = req.path.slice(1);
  let repo = getRepo(assetPath);

  if (!repo.has(assetPath))
    return next();

  if (/\.js/.test(req.path))
    res.setHeader('Content-Type', 'application/javascript');
  else if (/\.css/.test(req.path)) 
    res.setHeader('Content-Type', 'text/css');

  console.log('serving: ' + path.join(repo.name, repo.filename(assetPath)));

  repo.code(assetPath)
  .then(code => res.send(code))
  .catch(error => {
    // send it to the socket

    res.send('error!')
  });
}


export function sendInline(req, res, next) {
  let repo = getRepo(req.path);

  if (repo.has(req.path))
    res.sendFile(repo.file(req.path));
  else
    next();
}


export function sendHTML(req, res) {
  let data = {appOrigin : '', renderOrigin : ''};

  let contentOrigin = 'https://usercontent.codex.press';
  let csp = (`
    default-src  'none';
    connect-src  'self' ${ contentOrigin } https://performance.typekit.net
                 ws://${ req.get('Host') };
    script-src   'unsafe-eval' 'self' ${ contentOrigin } https://use.typekit.net;
    style-src    'unsafe-inline' 'self' ${ contentOrigin }
                 https://use.typekit.net https://fonts.googleapis.com;
    font-src     data: 'self' ${ contentOrigin } 
                 https://use.typekit.net https://fonts.gstatic.com;
    img-src      blob: data: 'self' ${ contentOrigin } https://p.typekit.net;
    media-src    blob: ${ contentOrigin };
  `).replace(/\s+/g,' ');

  res.setHeader('Content-Security-Policy', csp);
  res.render('index.pug', data);
}

