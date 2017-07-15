import fsp from 'fs-promise';
import fs from 'fs';
import path from 'path';
import browserify from 'browserify-incremental';
import deps from 'module-deps';
import chalk from 'chalk';

let dependencies = {};

import { Readable } from 'stream';
import concat from 'concat-stream';

import * as babel from 'babel-core';

export default async function transpileJavascript({
  filename, directory, assetPath
}) {

  let fullPath = path.join(directory, filename);

  let code = await fsp.readFile(fullPath, 'utf-8');

  try {
    let result = babel.transform(code, {
      moduleId: assetPath,
      sourceMaps: 'inline',
      presets: [['es2015', { modules: false }]],
      plugins: [ 'transform-es2015-modules-systemjs' ]
    });

    // must return dependencies as well? or the frontend knows them???
    return result.code;
  }
  catch (error) {

    if (error._babel) {
      let message = `Error in file "${ fullPath }":\n  ${ error.message}`;
      console.error(chalk.red(message));
      console.error(error.codeFrame);

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


