
export let dependencyTree = {};

import fsp from 'fs-promise';
import path from 'path';

// windows backsalsh nightmare
let sep = path.sep === '\\' ? '\\\\' : '/';

let reposDir = '/Users/omar/code/codex_press';

export function getFilename(assetPath) {

  return new Promise((resolve, reject) => {
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



import chokidar from 'chokidar';

import {broadcast} from './socket';

let watcher = chokidar.watch('./public');

watcher.on('all', (event, filename) => {
  broadcast(filename);
});



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
