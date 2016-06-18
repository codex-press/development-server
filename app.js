'use strict';

const fsp = require('fs-promise');
const less = require('less');
const app = require('express')();

var reposDir = './repos';
var repos = ['coda','stock'];

app.get('/manifest.json', (req, res) => {
  console.log('serving manifest', repos);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.json({repos});
});

// Serve assets
app.get(/\.(less|js|ttf|woff)$/, (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  let filename = reposDir + req.url;
  console.log('serving ' + filename);
  res.sendFile(filename);
});

// compile LESS.js
app.get(/\.css$/, (req, res) => {
  res.setHeader('content-type', 'text/css');

  let filename = getFilename(req.url);
  console.log('serving: ', filename);

  fsp.readFile(filename, {encoding:'utf8'})
  .catch(err => {
    res.status(404).send('404: ' + filename);
  })
  .then(out => {
    return less.render(out, {paths: [reposDir], filename: filename})
  })
  .then(out => {
    res.send(out.css);
  })
  .catch(err => {
    console.log(err);
    res.status(500).send('help!');
  });

});

app.listen(8000, () => { console.log('port 8000: HTTP'); });


// WebSocket
var wsPort = 8080;
var wsServer = new require('ws').Server({port: wsPort});
console.log('port 8080: WebSocket');

wsServer.on('connection', function connection(ws) {
  console.log('connect');
});


var chokidar = require('chokidar');
// ignores .dotfiles and libraries
var watcher = chokidar.watch(reposDir,{
  ignored: [ /[\/\\]\./, /.*node_modules.*/],
});

watcher.on('all', (event, path) => {

  console.log(/\.(css|less)$/.test(path), path);

  if (event == 'add')
    console.log('watching: ', path);
  else if (event == 'change' && /\.(css|less)$/.test(path)) {
    console.log('update: ', getUrl(path));
    wsServer.clients.forEach(function each(client) {
      client.send(JSON.stringify({path: getUrl(path)}));
    });
  }
});


function getFilename(url) {
  console.log({url});
  let requestPath = url.match(/(.*).css/)[1];
  return reposDir + requestPath + '/index.less';
}

function getUrl(filename) {
  let re = new RegExp('/(.*)/index.less');
  return filename.match(re)[1] + '.css';
}

