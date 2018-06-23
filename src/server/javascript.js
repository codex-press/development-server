import fs from 'mz/fs';
import path from 'path';

import * as log from './log';
import { Readable } from 'stream';
import * as babel from 'babel-core';

let dependencies = {};


export async function transpileScript(args) {

  const { filename, directory, assetPath } = args;

  let fullPath = path.join(directory, filename);

  let code = await fs.readFile(fullPath, 'utf-8');

  const env = process.env.NODE_ENV
  process.env.NODE_ENV = 'development'

  try {

    const result = babel.transform(code, {
      moduleId: assetPath,
      sourceMaps: 'inline',
      sourceFileName: fullPath,
      presets: [[ require.resolve('babel-preset-env'), { modules: false }]],
      plugins: [
        require.resolve('babel-plugin-transform-custom-element-classes'),
        require.resolve('babel-plugin-transform-react-jsx'),
        require.resolve('babel-plugin-syntax-dynamic-import'),
        require.resolve('babel-plugin-transform-new-target'),
        require.resolve('babel-plugin-transform-node-env-inline'),
      ]
    });

    process.env.NODE_ENV = env

    return result.code;
  }
  catch (error) {

    process.env.NODE_ENV = env

    let message = `Error in file "${ fullPath }":\n  ${ error.message}`;
    log.error(message);
    if (error.codeFrame)
      log.error(error.codeFrame);

    throw {
      type: 'JavaScript',
      filename,
      message: error.message,
      line: error.loc && error.loc.line, 
      column: error.loc && error.loc.column,
      // removes ANSI color escapes
      extract: error.codeFrame && error.codeFrame.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,''),
    }

  }

}


export async function transpileModule(args) {

  const { filename, directory, assetPath } = args;

  let fullPath = path.join(directory, filename);

  let code = await fs.readFile(fullPath, 'utf-8');

  const env = process.env.NODE_ENV
  process.env.NODE_ENV = 'development'

  try {

    const result = babel.transform(code, {
      moduleId: assetPath,
      sourceMaps: 'inline',
      sourceFileName: fullPath,
      presets: [[ require.resolve('babel-preset-env'), { modules: false }]],
      plugins: [
        require.resolve('babel-plugin-transform-custom-element-classes'),
        require.resolve('babel-plugin-transform-es2015-modules-systemjs'),
        require.resolve('babel-plugin-transform-react-jsx'),
        require.resolve('babel-plugin-syntax-dynamic-import'),
        require.resolve('babel-plugin-transform-new-target'),
        require.resolve('babel-plugin-transform-node-env-inline'),
      ]
    });

    process.env.NODE_ENV = env

    return result.code;
  }
  catch (error) {

    process.env.NODE_ENV = env

    let message = `Error in file "${ fullPath }":\n  ${ error.message}`;
    log.error(message);
    if (error.codeFrame)
      log.error(error.codeFrame);

    throw {
      type: 'JavaScript',
      filename,
      message: error.message,
      line: error.loc && error.loc.line, 
      column: error.loc && error.loc.column,
      // removes ANSI color escapes
      extract: error.codeFrame && error.codeFrame.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,''),
    }

  }

}


