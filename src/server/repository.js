import EventEmitter from 'events';
import path from 'path';
import fs from 'fs';
import fsp from 'fs-promise';

import NodeCache from 'node-cache';
import glob from 'glob';
import sane from 'sane';
import micromatch from 'micromatch';

import * as log from './log';
import js from './javascript';
import css from './css';


export default class Repository extends EventEmitter {

  constructor({ name, directory, watch = true }) {
    super();
    this.broken = false;
    this.name = name;
    this.dir = path.normalize(directory);
    if (this.dir.endsWith(path.sep))
      this.dir = this.dir.slice(0, -1);
    this.loadFiles();
    if (watch) this.watch();
  }


  loadFiles() {
    try {
      fs.statSync(this.dir);
      this.files = [];
      this.cache = new NodeCache({ stdTTL: 600 });
      this.loadConfig();
      this.ready = new Promise(resolve => {
        let opts = { cwd: this.dir, ignore: 'node_modules/**', nodir: true };
        glob('**/*', opts, (error, files) => {
          this.files = files.map(filename => ({ filename }))
          this.dedupeFiles();
          resolve();
        });
      });
    }
    catch (error) {
      this.broken = true;
      this.ready = Promise.resolve();
      if (error.code !== 'ENOENT')
        log.error(error);
    }
  }


  watch() {
    this.watcher = sane(this.dir, { ignored: /node_modules/ })
    .on('error',  () => log.error('error', this.name))
    .on('add',    path => this.add(path))
    .on('change', path => this.change(path))
    .on('delete', path => this.remove(path))
  }


  close() {
    if (this.watcher) this.watcher.close();
  }


  toJSON() {

    if (this.broken) {
      return {
        name: this.name,
        path: this.dir,
        broken: true
      };
    }

    const assets = this.files
    .map(a => a.path)
    .filter(p => !!p)
    .sort((a, b) => {
      if (a < b)
        return -1;
      else if (a > b)
        return 1;
      else
        return 0;
    });

    const files = this.files
    .sort((a, b) => {
      if (a.filename < b.filename)
        return -1;
      else if (a.filename > b.filename)
        return 1;
      else
        return 0;
    });


    return {
      name: this.name,
      path: this.dir,
      assets,
      files,
    };
  }


  findAsset(assetPath) {
    return this.files.find(f => f.path === assetPath);
  }


  findFilename(assetPath) {
    let asset = this.findAsset(assetPath);
    if (asset)
      return asset.filename;
  }


  assetPath(filename) {
    let ext = path.extname(filename).slice(1);

    let assetPath = '';

    // can't have strange characters, including underscores
    if (/[^-/.a-z0-9]/i.test(filename))
      return null;
    // .less files become .css
    else if ('less' == ext)
      assetPath = filename.slice(0, -4) + 'css';
    // .dev.css becomes .css
    else if (/\.dev\.(js|css)$/.test(filename))
      assetPath = filename.replace(/\.dev\.(js|css)$/, '.$1');
    // normal extensions
    else if (['css', 'js', 'svg', 'html', 'ttf', 'woff', 'woff2'].includes(ext))
      assetPath = filename
    // other things are ignored
    else
      return null;

    // Windows backslash nightmare
    if (path.sep === '\\')
      assetPath = assetPath.replace(/\\/g, '/');

    return '/' + this.name + '/' + assetPath;
  }


  loadConfig() {

    this.ignoreMatchers = [ '**/_*' ];

    this.config = {
      script: [],
      ignore: [],
    }

    try {
      const json = fs.readFileSync(this.dir + '/package.json');
      const config = JSON.parse(json).codex || {};

      const validStrArr = prop => {
        const valid = (
          !(prop in config) || (
            config[prop] instanceof Array &&
            config[prop].every(s => typeof s === 'string')
          )
        );

        if (valid)
          return config[prop];
        else
          log.error(
            `"${ prop }" section of Codex configuration must be an array of strings`
          );
      }

      this.config.script = validStrArr('script') || [];
      this.config.ignore = validStrArr('ignore') || [];
      if (validStrArr('only'))
        this.config.only = config.only;
    }
    catch (e) {
      if (e.code !== 'ENOENT')
        log.error(e);

      return;
    }

    this.ignoreMatchers = this.config.ignore.reduce((ignore, i) => {
      ignore.push(i);
      // recursively ignore by default
      ignore.push(i.endsWith('/') ? i + '**/*' : i + '/**/*');
      return ignore;
    }, this.ignoreMatchers);

    this.dedupeFiles();
  }


  async code(assetPath, { useModules = false } = {}) {

    let asset = this.files.find(f => f.path === assetPath);

    if (!asset)
      throw new Error('Not found: ' + assetPath);

    const cached = this.cache.get(assetPath);
    if (cached && !useModules)
      return cached;

    try {
      if (/\.css$/.test(assetPath)) {

        let { deps, code } = await css({
          repositoryName: this.name,
          assetPath,
          filename: asset.filename,
          directory: this.dir,
        });

        this.cache.set(assetPath, code);
        asset.deps = deps;
        return code;
      }
      else if (/\.js$/.test(assetPath)) {

        let script = this.config.script.includes(asset.filename);

        if (script || useModules) {
          return fsp.readFile(path.join(this.dir, asset.filename), 'utf-8');
        }
        else {
          let code = await js({
            assetPath,
            filename: asset.filename,
            directory: this.dir,
          });
          this.cache.set(assetPath, code);
          return code;
        }

      }
    }
    catch (error) {

      this.emit('message', {
        event: 'error',
        repositoryName: this.name,
        filename: asset.filename,
        paths: this.findAffectedAssetPaths(asset.filename),
        error,
      });

      throw error;
    }

  }


  shouldIgnore(filename) {
    if (!/\.(js|css|less|svg|html|ttf|woff|woff2)$/.test(filename))
      return true;
    else if (this.config.only)
      return !this.config.only.includes(filename);
    else
      return micromatch.any(filename, this.ignoreMatchers);
  }


  findAffectedAssetPaths(filename) {
    return this.files
      .filter(f => f.deps && f.deps.includes(filename))
      .map(f => f.path)
      .concat([this.assetPath(filename)]);
  }


  change(filename) {
    log.cyan(`change ${ this.name }:  ${ filename }`);

    if (filename === 'package.json') {
      this.loadConfig();
      this.emit('message', {
        repositoryName: this.name,
        event: 'change',
        filename,
      });
      return;
    }

    let file = this.files.find(f => f.filename === filename);

    if (file.path) {
      this.cache.del(file.path);
      this.emit('message', {
        repositoryName: this.name,
        event: 'change',
        filename,
        paths: this.findAffectedAssetPaths(filename),
      });
    }

  }



  add(filename, silent = false) {
    log.cyan(`add ${ this.name }:  ${ filename }`);

    if (this.shouldIgnore(filename))
      this.files.push({ filename });
    else
      this.files.push({ filename, path: this.assetPath(filename) });

    if (filename === 'package.json') {
      this.loadConfig();
      this.emit('message', {
        repositoryName: this.name,
        event: 'add',
        filename,
      });
      return;
    }
    else {
      this.dedupeFiles();
    }

    if (!this.shouldIgnore(filename)) {
      this.emit('message', {
        repositoryName: this.name,
        event: 'add',
        filename,
        paths: [ this.assetPath(filename) ],
      });
    }

  }



  remove(filename) {
    log.cyan(`remove ${ this.name }:  ${ filename }`);

    this.files = this.files.filter(f => f.filename !== filename);

    this.dedupeFiles();

    if (!this.shouldIgnore(filename)) {
      this.emit('message', {
        repositoryName: this.name,
        event: 'remove',
        filename,
        paths: [ this.assetPath(filename) ],
      });
    }
  }



  dedupeFiles() {

    // add asset paths to everything
    this.files = this.files.map(f => {
      if (this.shouldIgnore(f.filename))
        return { filename: f.filename };
      else
        return { filename: f.filename, path: this.assetPath(f.filename) };
    });

    // remove asset paths from the ones that have duplicates
    this.files.forEach(f => {
      if (!f.path) return;

      this.files
      .filter(dup => dup.path === f.path && dup.filename != f.filename)
      .forEach(dup => {

        var weaker = (
          f.filename.endsWith('.less') ||
          dup.filename.endsWith('.dev.js') ||
          dup.filename.endsWith('.dev.css')
        );

        if (weaker) delete f.path;
      });
    });

  }

}

