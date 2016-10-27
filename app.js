'use strict';

let version = '0.0.1';
let fileList = {};

let reposDir = 'repos';

const fs = require('fs');
const url = require('url');
const path = require('path');
const fsp = require('fs-promise');
const hbs = require('hbs');
const https = require('https');
const express = require('express');
const less = require('less');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const browserify = require('browserify-incremental');

// servers on port 8000
let options = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem'),
};
let server = https.createServer(options);

// windows backsalsh nightmare
let sep = path.sep === '\\' ? '\\\\' : '/';

// WebSocket
// ---------
// It sends fileList whenever files are added, removed or changed.
let wsServer = new require('ws').Server({server});

wsServer.on('connection', function connection(ws) {
  let sock = ws._socket;
  console.log(`WS connect ${sock.remoteAddress}:${sock.remotePort}`); 
  ws.send(JSON.stringify({version, fileList}));
});

let chokidar = require('chokidar');
// ignores .dotfiles and libraries
let watcher = chokidar.watch(reposDir,{
  ignored: [ /[\/\\]\./, /.*node_modules.*/],
});

watcher.on('all', (event, filename) => {
  if (event == 'add')
    fileAdd(filename);
  else if (event == 'unlink')
    fileRemove(filename);
  else if (event == 'change')
    fileChange(filename);
});

function broadcast(message) {
  message = JSON.stringify(message);
  wsServer.clients.map(client => client.send(message));
}


const app = express();
app.set('view engine', 'hbs');
app.engine('hbs', hbs.__express); 
server.on('request', app);
server.listen(8000);
console.log('listening on port 8000'); 

app.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods' : 'GET',
    'Cache-Control' : 'private, no-cache, max-age=0, must-revalidate',
    'Expires' : 'Fri, 01 Jan 1990 00:00:00 GMT',
    'Pragma' : 'no-cache',
  });
  next();
});

// serves repository list
app.get('/', (req, res) => {
  let data = {version, fileList: JSON.stringify(fileList, undefined, 2)};
  res.render('index', data);
});

app.get('/file_list.json', (req, res) => {
  res.json(fileList);
});

// Serve Assets
// ------------

let browserifiers = {};
let dependencyTree = {};

app.get(/\.(css|js|ttf|svg|hbs|es6|woff)$/, (req, res) => {
  let assetPath = url.parse(req.url).pathname.slice(1);
  let filename;

  getFilename('/' + assetPath)
  .then(result => {
    filename = result;
    console.log('serving: ' + filename);

    if (/\.less$/.test(filename))
      return compileLess(filename, res);
    else if (/\.es6$/.test(filename) && /\.js$/.test(req.path))
      return compileJavascript(filename, assetPath, res);
    else if (/\.css/.test(filename)) {
      return fsp.readFile(__dirname + '/' + filename, {encoding:'utf8'})
      .then(css => postcss([autoprefixer]).process(css))
      .then(out => { 
        res.setHeader('content-type', 'text/css');
        res.send(out.css);
      });
    }
    else if (filename)
      res.sendFile(__dirname + '/' + filename);

  })
  .catch(error => {
    console.error(error.message);
    broadcast({assetPath, error});

    if (!res.finished) {
      if (error.type === 'Not Found')
        res.status(404).send('404: ' + assetPath);
      else
        res.status(500).send('500: ' + error.message);
    }
  });
});


function compileJavascript(filename, assetPath, res) {
  res.setHeader('content-type', 'application/javascript');

  // dependencies come back with symlinks resolved, so we need real
  // path to this repository
  let repo = assetPath.match(RegExp('(.*?)[/.]'))[1];
  let repoPath = path.join(__dirname, reposDir, repo);
  let realRepoPath = fs.realpathSync(repoPath);

  let external = 'app article plugin touch animate collection dom events\
                  log utility handlebars'.split(' ');

  if (!browserifiers[filename]) {
    browserifiers[filename] = browserify(filename, {
      debug: true,
      extensions: ['.es6']
    })
    .transform('babelify', {'presets': ['es2015-loose']})
    .external(external)

    browserifiers[filename].on('dep', data => {
      if (data.file.indexOf(realRepoPath) === 0) {
        let relative = data.file.slice(realRepoPath.length);
        let dep = path.join(reposDir, repo, relative);
        dependencyTree[filename] = dependencyTree[filename] || [];
        dependencyTree[filename].push(dep);
      }
    });
  }

  // buffer response so we can send errors properly
  let code = '';
  return new Promise((resolve, reject) => {
    browserifiers[filename].bundle()
    .on('error', error => reject(error))
    .on('data', data => code += data)
    .on('end', () => res.send(code));
  })
  .catch(error => {
    // sends to console
    res.send(`console.error("${error.message}");`);
    if (error._babel) {
      throw {
        type: 'JavaScript',
        filename,
        message: error.message,
        line: error.loc.line, 
        column: error.loc.column,
        // removes ANSI color escapes
        extract: error.codeFrame.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,''),
      };
    }
    else {
      throw {
        type: 'Syntax',
        filename,
        message: error.message,
      };
    }
  });
};


function compileLess(filename, res) {
  res.setHeader('content-type', 'text/css');

  let opts = {
    filename,
    strictMath: true,
    strictUnits: true,
    sourceMap: {
      outputSourceFiles: true,
      sourceMapFileInline: true,
    },
  };

  return fsp.readFile(filename, {encoding:'utf8'})
  .then(out => less.render(out, opts))
  .then(out => {
    dependencyTree[filename] = out.imports;
    return postcss([autoprefixer]).process(out.css);
  })
  .then(out => res.send(out.css))
  .catch(error => {
    throw {
      filename,
      type: error.type,
      message: error.message,
      line: error.line, 
      column: error.index,
      extract: error.extract ? error.extract.join('\n') : '',
    }
  })
};


function getFilename(assetPath) {
  return new Promise(function(resolve, reject) {
    let basename = reposDir + assetPath.match(/(.*)\..*/)[1];

    function recurse(exts) {
      return fsp.stat(basename + exts[0])
      .then(s => resolve(basename + exts[0]))
      .catch(e => exts.length > 1 ? recurse(exts.slice(1)) : reject(e))
    };

    if (/\.js$/.test(assetPath))
      recurse(`.dev.js ${sep}index.dev.js .js ${sep}index.js .es6 ${sep}index.es6`.split(' '));
    else if (/\.css$/.test(assetPath))
      recurse(`.css .less ${sep}index.css ${sep}index.less`.split(' '));
    else {
      return fsp.stat(reposDir + assetPath)
      .then(s => resolve(reposDir + assetPath))
      .catch(e => reject(e));
    }
  })
  .catch(error => {
    throw {
      type: 'Not Found',
      message: 'Asset not found: ' + assetPath,
    };
  })
};


function getUrl(filename) {
  let cssRegEx = RegExp(`${reposDir}${sep}(.*?)(\\.css|\\.less|${sep}index\\.css|${sep}index\\.less)$`);
  let jsRegEx = RegExp(`${reposDir}${sep}(.*?)(\\.js|\\.es6|${sep}index\\.dev\\.js|${sep}index\\.js|${sep}index\\.es6)$`);

  let urlPath = '';
  if (filename.match(cssRegEx))
    urlPath = filename.match(cssRegEx)[1] + '.css';
  else if (filename.match(jsRegEx))
    urlPath = filename.match(jsRegEx)[1] + '.js';

  // Windows backslash nightmare
  return urlPath.replace(RegExp(sep, 'g'), '/');
};


function fileRemove(filename) {
  console.log('removed: ', filename);
  let repo = filename.match(RegExp(`^${reposDir}${sep}(.*?)${sep}`))[1];
  let url = getUrl(filename);
  if (url) {
    let i = fileList[repo].findIndex(u => u == url);
    if (i >= 0) {
      fileList[repo].splice(i,1);
      broadcast({fileList});
    }
  }

  // since getUrl for es6 file retuns .js this needs to be separate
  let inlineRegEx = RegExp(`${reposDir}${sep}(.*?\\.(svg|es6|hbs))`);
  if (inlineRegEx.test(filename)) { 
    let assetPath = filename.match(inlineRegEx)[1];
    assetPath = assetPath.replace(RegExp(sep, 'g'), '/');
    let i = fileList[repo].findIndex(u => u == url);
    fileList[repo].splice(i,1);
    broadcast({fileList});
  }
};


function fileAdd(filename) {
  console.log('watching: ', filename);
  let regex = RegExp(`^${reposDir}${sep}(.*?)${sep}`);
  let repo = filename.match(regex)[1];
  fileList[repo] = fileList[repo] || [];
  let url = getUrl(filename);
  if (url) {
    if (!fileList[repo].find(u => u == url)) {
      fileList[repo].push(url);
      broadcast({fileList});
    }
  }

  // since getUrl for es6 file retuns .js this needs to be separate
  let inlineRegex = RegExp(`${reposDir}${sep}(.*?\\.(svg|es6|hbs))`);
  if (inlineRegex.test(filename)) {
    let assetPath = filename.match(inlineRegex)[1];
    assetPath = assetPath.replace(RegExp(sep, 'g'), '/');
    fileList[repo].push(assetPath);
    broadcast({fileList});
  }
};


function fileChange(filename) {
  console.log('change: ', filename);

  // search in dependencyTree for all files that depend on this one
  let filenames = Object.keys(dependencyTree).filter(f => {
    return dependencyTree[f].indexOf(filename) >= 0;
  });
  filenames.push(filename);

  // send self if it's an inline asset
  if (/\.(svg|hbs|es6)$/.test(filename)) {
    let assetPath = filename.slice(reposDir.length + 1);
    assetPath = assetPath.replace(RegExp(sep, 'g'), '/');
    broadcast({fileList, assetPath});
  }

  // send dependents
  filenames.map(filename => {
    console.log('sending update: ', getUrl(filename));
    broadcast({fileList, assetPath: getUrl(filename)});
  });

}
