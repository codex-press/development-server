import fsp from 'fs-promise';
import fs from 'fs';
import path from 'path';
import browserify from 'browserify-incremental';
import deps from 'module-deps';

let compilers = {};

export default function transpileJavascript(filename, directory, assetPath) {
  let fullPath = path.join(directory, filename);

  if (!compilers[fullPath])
    compilers[fullPath] = createCompiler(filename, directory, assetPath);

  return findExternal(filename, directory)
  .then(external => {

    let code = '';
    return new Promise((resolve, reject) => {
      compilers[fullPath].external(external).bundle()
      .on('error', error => { console.log('here!', error); reject(error)})
      .on('data', data => code += data)
      .on('end', () => resolve(code));
    })

  })
  .catch(error => {

    console.error(error);

    // send to browser console
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

}


function createCompiler(filename, directory, assetPath) {
  return browserify(filename, {basedir: directory, debug: true})
  .transform('babelify', {'presets': ['es2015']})
  .require(path.join(directory, filename), {expose: '/' + assetPath})
}


function findExternal(filename, directory) {

  return new Promise((resolve, reject) => {

    let external = [];

    deps({
      transform: [['babelify', { presets: 'es2015' }]],
      ignoreMissing: true,
    })
    .on('error', err => reject(err))
    .on('missing', (id, parent) => { 
      if (RegExp('^/').test(id))
        external.push(id);
    })
    .on('file', (path, relative) => {
      if (path.indexOf(directory) !== 0)
        throw `Bad import: ${relative}`;
    })
    .on('data', () => { })
    .on('end', () => resolve(external))
    .end({file: path.join(directory, filename)});

  });

}

