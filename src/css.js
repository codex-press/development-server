import path from 'path';
import fsp from 'fs-promise';

import less from 'less';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';


export default function processCSS(filename, directory) {

  if (/\.css$/.test(filename)) {
    return fsp.readFile(path.join(directory, filename), {encoding:'utf8'})
    .then(css => postcss([autoprefixer]).process(css))
    .then(out => { 
      res.setHeader('content-type', 'text/css');
      res.send(out.css);
    });
  }
  else if (/\.less$/.test(filename)) {

    let dependencies = [];

    let opts = {
      filename: path.join(directory, filename),
      strictMath: true,
      strictUnits: true,
      sourceMap: {
        outputSourceFiles: true,
        sourceMapFileInline: true,
      },
    };

    return fsp.readFile(path.join(directory, filename), 'utf8')
    .then(out => less.render(out, opts))
    .then(out => {
      dependencies = out.imports;
      return postcss([autoprefixer]).process(out.css);
    })
    .then(out => ({dependencies, code: out.css}))
    .catch(error => {
      console.log(error);

      throw {
        filename,
        type: error.type,
        message: error.message,
        line: error.line, 
        column: error.index,
        extract: error.extract ? error.extract.join('\n') : '',
      }
    })
  }

}
