'use strict';

var reposDir = 'repos';

const fs = require('fs');
const url = require('url');
const fsp = require('fs-promise');

const less = require('less');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');

const browserify = require('browserify-incremental');

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
  res.setHeader('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');
  res.setHeader('Expires', 'Fri, 01 Jan 1990 00:00:00 GMT');
  res.setHeader('Pragma', 'no-cache');
  next();
});

// serve repository list
app.get('/repos.json', (req, res) => {
  console.log('serving: repos.json');
  res.json({repos})
});

let browserifiers = {};

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

      let opts = {
        filename,
        strictMath: true,
        sourceMap: {
          outputSourceFiles: true,
          sourceMapFileInline: true,
        },
      };

      fsp.readFile(filename, {encoding:'utf8'})
      .then(out => less.render(out, opts))
      .then(out => postcss([autoprefixer]).process(out.css))
      .then(out => res.send(out.css))
      .catch(err => {
        console.log(err);
        res.status(500).send('help!')
      });
    }
    // compile .es6 to .js
    else if (/\.es6/.test(filename)) {
      res.setHeader('content-type', 'application/javascript');

      let external = 'app article plugin touch animate collection dom events\
                      log utility'.split(' ');

      if (!browserifiers[filename]) {
        browserifiers[filename] = browserify(filename, {
          debug: true,
          extensions: ['.es6']
        })
        .transform('babelify', {'presets': ['es2015-loose']})
        .external(external)
      }

      browserifiers[filename].bundle().pipe(res);
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
      recurse('.dev.js /index.dev.js .js /index.js .es6 /index.es6'.split(' '));
    else if (/\.css$/.test(pathname))
      recurse('.css .less /index.css /index.less'.split(' '));
    else
      return fsp.stat(reposDir + pathname).then(s => resolve(reposDir + pathname));
  });
}

function getUrl(filename) {
  let cssRegEx = /repos\/(.*?)(\.css|\.less|\/index\.css|\/index\.less)/;
  let jsRegEx = /repos\/(.*?)(\.js|\/index\.dev\.js|\/index\.js|\.es6|\/index\.es6)/;

  if (filename.match(cssRegEx))
    return filename.match(cssRegEx)[1] + '.css';
  else if (filename.match(jsRegEx))
    return filename.match(jsRegEx)[1] + '.js';
}

