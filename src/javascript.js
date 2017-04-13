import fsp from 'fs-promise';
import fs from 'fs';
import path from 'path';
import browserify from 'browserify-incremental';

import {getFilename, dependencyTree} from './filesystem';

let reposDir = '/Users/omar/code/codex_press';

let browserifiers = {};

export default (req, res, next) => {
  res.setHeader('content-type', 'application/javascript');

  let assetPath = req.path.slice(1);
  let filename;

  getFilename('/' + assetPath)
  .then(result => {
    filename = result;

    if (/\.js$/.test(filename))
      return res.sendFile(filename);

    // dependencies come back with symlinks resolved, so we need real
    // path to this repository
    let repo = assetPath.match(RegExp('(.*?)[/.]'))[1];
    let repoPath = path.join(reposDir, repo);
    let realRepoPath = fs.realpathSync(repoPath);

    let external = 'app article plugin touch animate collection dom events\
                    log utility env'.split(' ');



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

      console.log(error);

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
  })
  .catch(next);

}

