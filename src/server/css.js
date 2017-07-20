import path from 'path';
import fsp from 'fs-promise';

import less from 'less';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';


export default async function processCSS(args) {
  const { assetPath, filename, directory, repositoryName } = args;

  const fullPath = path.join(directory, filename);

  if (/\.css$/.test(filename)) {

    const source = await fsp.readFile(fullPath, 'utf8')
    const css = postcss([autoprefixer]).process(source);

    return css;
  }
  else if (/\.less$/.test(filename)) {

    try {

      const source = await fsp.readFile(fullPath, 'utf8');

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
      console.log(error);

      throw {
        filename,
        type: error.type,
        message: error.message,
        line: error.line, 
        column: error.index,
        extract: error.extract ? error.extract.join('\n') : '',
      };
    }

  }

}
