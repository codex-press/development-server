import path from 'path';
import fs from 'mz/fs';

import * as log from './log';
import less from 'less';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';


export default async function processCSS(args) {
  const { assetPath, filename, directory, repositoryName } = args;

  const fullPath = path.join(directory, filename);

  if (/\.css$/.test(filename)) {

    try {
      const source = await fs.readFile(fullPath, 'utf8')
      const { css } = postcss([autoprefixer]).process(source);

      return { code: css };
    }
    catch (error) {
      log.error(error);

      throw {
        filename,
        type: 'CSS',
        message: error.reason,
        line: error.line, 
        column: error.column,
      }

    }

  }
  else if (/\.less$/.test(filename)) {

    try {

      const source = await fs.readFile(fullPath, 'utf8');

      let out = await less.render(source, {
        filename: fullPath,
        strictMath: true,
        strictUnits: true,
        sourceMap: {
          outputSourceFiles: true,
          sourceMapFileInline: true,
        },
      });

      const deps = out.imports.map(i => i.slice(directory.length + 1));

      out = await postcss([autoprefixer]).process(out.css, { map: true });

      return { deps, code: out.css };
    }
    catch (error) {
      log.error(error);

      throw {
        filename,
        type: 'CSS',
        message: error.message,
        line: error.line, 
        column: error.index,
        extract: error.extract ? error.extract.join('\n') : '',
      }

    }

  }

}
