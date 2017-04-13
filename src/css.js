import fsp from 'fs-promise';
import less from 'less';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';

import {getFilename, dependencyTree} from './filesystem';


export default (req, res, next) => {
  res.setHeader('content-type', 'text/css');

  let assetPath = req.path.slice(1);
  let filename;

  getFilename('/' + assetPath)
  .then(result => {
    filename = result;
    console.log('serving: ' + filename);

    if (/\.css$/.test(filename)) {
      return fsp.readFile(__dirname + '/' + filename, {encoding:'utf8'})
      .then(css => postcss([autoprefixer]).process(css))
      .then(out => { 
        res.setHeader('content-type', 'text/css');
        res.send(out.css);
      });
    }
    else if (/\.less$/.test(filename)) {

      let opts = {
        filename,
        strictMath: true,
        strictUnits: true,
        sourceMap: {
          outputSourceFiles: true,
          sourceMapFileInline: true,
        },
      };

      return fsp.readFile(filename, {encoding:'utf8'})
      .then(out => less.render(out, opts))
      .then(out => {
        dependencyTree[filename] = out.imports;
        return postcss([autoprefixer]).process(out.css);
      })
      .then(out => res.send(out.css))
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

  })
  .catch(next);


}
