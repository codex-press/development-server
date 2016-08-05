'use strict';

var reposDir = 'repos';

const fs = require('fs');
const url = require('url');
const fsp = require('fs-promise');

const less = require('less');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');

const https = require('https');
const express = require('express');
const app = express();

var repos;

fsp.readdir(reposDir)
.then(listing => repos = listing.filter(d => d != '.keep'))
.catch(err => console.log(err));

// server on port 8000
let options = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem'),
};
let server = https.createServer(options);
server.on('request', app);
server.listen(8000);
console.log('listening on port 8000'); 

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  next();
});

// serve repository list
app.get('/repos.json', (req, res) => {
  console.log('serving: repos.json');
  res.json({repos})
});

// serve assets
app.get(/\.(css|js|ttf|woff)$/, (req, res) => {
  let pathname = url.parse(req.url).pathname;

  getFilename(pathname)
  .then(filename => {

    // only log js/css (not fonts)
    if (/\.(js|less|css)$/.test(filename))
      console.log('serving: ' + filename);

    // compile .less to .css
    if (/\.less$/.test(filename)) {
      res.setHeader('content-type', 'text/css');

      fsp.readFile(filename, {encoding:'utf8'})
      .then(out => less.render(out, {filename, strictMath: true}))
      .then(out => postcss([autoprefixer]).process(out.css))
      .then(out => res.send(out.css))
      .catch(err => {
        console.log(err);
        res.status(500).send('help!')
      });
    }
    else if (filename)
      res.sendFile(__dirname + '/' + filename);
    else
      res.status(404).send('404: ' + filename);
  })
  .catch(err => {
    if (err && err.code == 'ENOENT') {
      console.log('can\'t find:', pathname);
      res.status(404).send('404: ' + pathname);
    }
    else if (err) {
      console.error(err);
      res.status(500).send('500: ' + err.message);
    }
  });
});


// WebSocket sends update when files change
var wsServer = new require('ws').Server({server});

wsServer.on('connection', function connection(ws) {
  let sock = ws._socket;
  console.log('connect', sock.remoteAddress + ':' + sock.remotePort); 
});

var chokidar = require('chokidar');
// ignores .dotfiles and libraries
var watcher = chokidar.watch(reposDir,{
  ignored: [ /[\/\\]\./, /.*node_modules.*/],
});

watcher.on('all', (event, path) => {
  if (event == 'add')
    console.log('watching: ', path.match(RegExp(reposDir + '/(.*)'))[1]);
  else if (event == 'change' && /\.(js|css|less)$/.test(path)) {
    console.log('update: ', getUrl(path));
    wsServer.clients.forEach(function each(client) {
      client.send(JSON.stringify({path: getUrl(path)}));
    });
  }
});

function getFilename(pathname) {
  return new Promise(function(resolve, reject) {
    let basename = reposDir + pathname.match(/(.*)\..*/)[1];

    let recurse = exts => {
      return fsp.stat(basename + exts[0])
      .then(s => resolve(basename + exts[0]))
      .catch(e => exts.length > 1 ? recurse(exts.slice(1)) : reject(e))
      .catch(e => console.log(e));
    };

    if (/\.js$/.test(pathname))
      recurse('.dev.js .js /index.dev.js /index.js'.split(' '));
    else if (/\.css$/.test(pathname))
      recurse('.less .css /index.less /index.css'.split(' '));
    else
      return fsp.stat(reposDir + pathname).then(s => resolve(reposDir + pathname));
  });
}

function getUrl(filename) {
  let cssRegEx = /repos\/(.*?)(\.less|\.css|\/index\.less|\/index\.css)/;
  let jsRegEx = /repos\/(.*?)(\.js|\/index\.dev\.js|\/index\.js)/;

  if (filename.match(cssRegEx))
    return filename.match(cssRegEx)[1] + '.css';
  else if (filename.match(jsRegEx))
    return filename.match(jsRegEx)[1] + '.js';
}

