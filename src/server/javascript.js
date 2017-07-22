import fsp from 'fs-promise';
import fs from 'fs';
import path from 'path';

import * as log from './log';
import { Readable } from 'stream';
import * as babel from 'babel-core';

let dependencies = {};


export default async function transpileJavascript(args) {

  const { filename, directory, assetPath } = args;

  let fullPath = path.join(directory, filename);

  let code = await fsp.readFile(fullPath, 'utf-8');

  try {
    let result = babel.transform(code, {
      moduleId: assetPath,
      sourceMaps: 'inline',
      sourceFileName: fullPath,
      presets: [[ require.resolve('babel-preset-env'), { modules: false }]],
      plugins: [ require.resolve('babel-plugin-transform-es2015-modules-systemjs') ]
    });

    return result.code;
  }
  catch (error) {

    if (error._babel) {
      let message = `Error in file "${ fullPath }":\n  ${ error.message}`;
      log.error(message);
      log.error(error.codeFrame);

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
      console.error(error);
      throw {
        type: 'Syntax',
        filename,
        message: error.message,
      };
    }

  }

}


