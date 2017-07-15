import EventEmitter from 'events';
import path from 'path';
import fs from 'fs';
import fsp from 'fs-promise';

import NodeCache from 'node-cache';
import chokidar from 'chokidar';

import js from './javascript';
import css from './css';


// windows backslash nightmare
let sep = path.sep === '\\' ? '\\\\' : '/';

export default class Repository extends EventEmitter {

  constructor({ name, directory, persistent = true }) {
    super();

    this.name = name;
    this.directory = directory;
    this.broken = false;
    this.files = [];
    this.cache = new NodeCache({ stdTTL: 600 });

    // promise to the point when all the files are found by chokidar
    this.ready = new Promise(resolve => this._resolve = resolve);

    try {
      fs.statSync(directory);
      this.loadConfig();
      this.watch({ persistent });
    }
    catch (e) {
      this.ready = Promise.resolve();
      if (e.code === 'ENOENT')
        this.broken = true;
      else
        console.error(e);
    }

  }


  findFilename(assetPath) {
    let asset = this.files.find(f => f.path === assetPath);
    if (asset)
      return asset.filename;
  }


  // will need to remove ignored here
  assets() {
    return this.files.reduce((list, a) => (
      !a.ignored && list.includes(a.path) ? list : list.concat([a.path])
    ), []);
  }


  toJSON() {
    if (this.broken) {
      return {
        name: this.name,
        path: this.directory,
        broken: true
      };
    }

    return {
      name: this.name,
      path: this.directory,
      assets: this.assets(),
      files: this.files,
    };
  }

  loadConfig() {
    try {
      const json = fs.readFileSync(this.directory + '/package.json');
      this.config = JSON.parse(json).codex
    }
    catch (e) {
      if (e.code !== 'ENOENT')
        console.error(e);
    }

    this.config = this.config || {};
    this.config.script = this.config.script || [];
  }


  has(assetPath) {
    return !!this.files.find(f => f.path === assetPath);
  }


  getMeta(filename) {
    return {
      script: this.config.script.includes(filename),
    }
  }


  async code(assetPath, {useModules = false} = {}) {

    let asset = this.files.find(f => f.path === assetPath);

    if (!asset)
      return 'not found!';

    // already compiled
    let cached = this.cache.get(assetPath);
    if (cached) return cached;

    let config = this.getMeta(asset.filename);

    if (/\.css$/.test(assetPath)) {
      let {dependencies, code} = await css(asset.filename, this.directory, assetPath)

      // this.dependencies[assetPath] = dependencies;
      return code;
    }
    else if (/\.js$/.test(assetPath)) {

      if (config.script || useModules) {
        let code = fsp.readFile(path.join(this.directory, asset.filename));
        //console.log('serving raw');
        this.cache.set(assetPath, code);
        return code;
      }
      else {

        //console.log('serving compiled');
        let code = await js({
          assetPath,
          filename: asset.filename,
          directory: this.directory,
        });

        this.cache.set(assetPath, code);

        return code;
      }

    }

  }



  close() {
    if (this.watcher) this.watcher.close()
  }



  watch({ persistent }) {
    let ignored = /node_modules|(^|[\/\\])\../;

    this.watcher = chokidar.watch(this.directory, { ignored, persistent })
    .on('error', () => console.log('error', this.name))
    .on('add', path => this.add(path))
    .on('ready', this._resolve)
    .on('change', path => this.change(path))
    .on('unlink', path => this.remove(path))
  }


  change(filename) {
    filename = filename.slice(this.directory.length + 1);

    if (filename === 'package.json') {
      this.loadConfig();
      return;
    }
    // ignore other .json files. unfortunately there's a bug in chokidar where
    // it will never file 'ready' if you give it an array of paths or add one
    // later :/
    else if (/.json$/.test(filename)) {
      return;
    }

    let assetPath = this.assetPath(filename);
    this.cache.del(assetPath);

    // XXX use dependency tree to get all assetPaths being updated

    this.emit('update', {change: [filename]});
  }


  remove(filename) {

    // XXX use dependency tree to get all assetPaths being updated

    this.emit('update', {remove: [filename]});
  }


  // XXX
  shouldIgnore(filename) {
    return false;
  }


  add(filename) {
    filename = filename.slice(this.directory.length + 1);

    if (process.env.NODE_ENV !== 'test')
      console.log(this.name + ': ' + filename);

    let assetPath = this.assetPath(filename);

    if (filename !== 'package.json') {
      this.files.push({
        filename,
        path: this.assetPath(filename),
        ignored: this.shouldIgnore(filename),
      });
    }

    if (assetPath) {

      // XXX there's an issue where if the existing file is removed, this one
      // won't come in to replace it.... hrm

      // use .css for .less 
      let shouldReplace = (
        !this.assets[assetPath] ||
        this.assets[assetPath].filename.length > filename.length
      );

      if (shouldReplace)
        this.assets[assetPath] = { assetPath, filename };

    }

    this.emit('update', {add: [filename]});
  }


  assetPath(filename) {
    let ext = path.extname(filename).slice(1);

    let assetPath = '';
    if ('less' == ext)
      assetPath = filename.slice(0, -4) + 'css';
    else if (['css','js'].includes(ext))
      assetPath = filename
    else
      return null;

    // Windows backslash nightmare
    return '/' + this.name + '/' + assetPath.replace(RegExp(sep, 'g'), '/');
  }

}
