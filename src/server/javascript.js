import fsp from 'fs-promise';
import fs from 'fs';
import path from 'path';
import browserify from 'browserify-incremental';
import deps from 'module-deps';
import chalk from 'chalk';

let compilers = {};
let dependencies = {};

export default function transpileJavascript(filename, directory, noParse = [], assetPath) {
  let fullPath = path.join(directory, filename);

  // create compiler
  if (!compilers[fullPath]) {
    let deps = [];
    compilers[fullPath] = createCompiler(filename, directory, assetPath, deps, noParse);
    dependencies[fullPath] = deps;
  }
  // reset dependency list (but keeping the same array)
  else {
    dependencies[fullPath].length = 0;
  }

  return findExternal(filename, directory, noParse)
  .then(external => {

    let code = '';
    return new Promise((resolve, reject) => {
      compilers[fullPath]
      .external(external)
      .bundle()
      .on('error', error => reject(error))
      .on('data', data => code += data)
      .on('end', () => resolve({dependencies: dependencies[fullPath], code}));
    })
  })
  .catch(error => {

    console.error(error.toString());

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


function createCompiler(filename, directory, assetPath, dependencies, noParse) {
  return browserify(filename, {basedir: directory, debug: true})
  .transform(babelify)
  .require(path.join(directory, filename), {expose: '/' + assetPath})
  .on('dep', data => {
    if (data.file.indexOf(directory) === 0)
      dependencies.push(data.file.slice(directory.length + 1));
  })
}


function findExternal(filename, directory, noParse) {

  let builtIn = ['assert', 'buffer', 'child_process', 'cluster', 'crypto',
    'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'https', 'net', 'os',
    'path', 'punycode', 'querystring', 'readline', 'stream', 'string_decoder',
    'tls', 'tty', 'url', 'util', 'v8', 'vm', 'zlib'
  ];

  return new Promise((resolve, reject) => {

    let external = [];

    deps({
      transform: [ babelify ], 
      ignoreMissing: true,
      noParse,
      filter: id => !builtIn.includes(id),
    })
    .on('error', err => {
      reject(err)
    })
    .on('missing', (id, parent) => { 
      if (RegExp('^/').test(id))
        external.push(id);
    })
    .on('file', (path, relative) => {
      if (path[0] === '/' && path.indexOf(directory) !== 0)
        console.log(chalk.green('bad import!'), path);
      // reject({message: `Bad import: ${relative}`});
    })
    .on('data', () => { })
    .on('end', () => resolve(external))
    .end({file: path.join(directory, filename)});

  });

}


function babelify(file, opts) {
  return require('babelify')(file, Object.assign({presets: 'es2015'}, opts))
}


