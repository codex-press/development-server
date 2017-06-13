import EventEmitter from 'events';
import path from 'path';
import fs from 'fs';
import fsp from 'fs-promise';
import chokidar from 'chokidar';

import js from './javascript';
import css from './css';


// windows backslash nightmare
let sep = path.sep === '\\' ? '\\\\' : '/';

export default class Repository extends EventEmitter {

  constructor({name, path}) {
    super();

    this.name = name;
    this.path = path;

    this.files = [];
    this.external = {};
    this.inline = {};
    this.dependencies = {};

    this.loadConfig();
    this.watch();

    // promise to the point when all the files are found by chokidar
    this.ready = new Promise(resolve => this._resolve = resolve);
  }


  loadConfig() {
    try {
      this.config = JSON.parse(fs.readFileSync(this.path + '/package.json')).codex
    }
    catch (e) {
      if (e.code !== 'ENOENT') console.error(e);
    }

    this.config = this.config || {};
    this.config.noParse = this.config.noParse || [];
  }


  has(assetPath) {
    return !!this.external[assetPath];
  }


  hasInline(assetPath) {
    return !!this.external[assetPath];
  }


  getMeta(filename) {
    return {
      noParse: this.config.noParse.includes(filename),
    }
  }


  code(assetPath) {
    let asset = this.external[assetPath];

    if (!asset)
      return Promise.resolve('not found!');

    // use options to see if it should be transpiled at all...
    // might just read the file with fs-promise

    let config = this.getMeta(asset.filename);

    if (/\.js/.test(assetPath) && config.noParse)
      return fsp.readFile(path.join(this.path, asset.filename));
    else if (/\.js/.test(assetPath)) {
      return js(asset.filename, this.path, this.config.noParse, assetPath)
      .then(({dependencies, code}) => {
        this.dependencies[assetPath] = dependencies;
        return code;
      });
    }
    else if (/\.css/.test(assetPath)) {
      return css(asset.filename, this.path, assetPath)
      .then(({dependencies, code}) => {
        this.dependencies[assetPath] = dependencies;
        return code;
      });
    }

  }


  filename(assetPath) {
    return this.external[assetPath].filename;
  }


  inlineFilename(assetPath) {
    return this.inlieAssets[assetPath].filename;
  }


  close() {
    this.watcher.close()
  }


  watch() {
    let ignored = /node_modules|(^|[\/\\])\../;
    let path = this.path + '/**/*@(js|css|less|svg|html|woff|woff2|ttf|json)';
    this.watcher = chokidar.watch(path, { ignored })
      .on('error', () => console.log('error', this.name))
      .on('add', path => this.add(path))
      .on('ready', () => this._resolve())
      .on('change', path => this.change(path))
      .on('unlink', path => this.remove(path))
  }


  change(filename) {
    filename = filename.slice(this.path.length + 1);

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

    // XXX use dependency tree to get all assetPaths being updated

    this.emit('update', {change: [filename]});
  }


  remove(filename) {

    // XXX use dependency tree to get all assetPaths being updated

    this.emit('update', {remove: [filename]});
  }


  add(filename) {
    filename = filename.slice(this.path.length + 1);

    console.log(this.name, filename);

    if (filename !== 'package.json')
      this.files.push({filename});

    let assetPath = this.assetPath(filename);
    if (assetPath) {

      // XXX there's an issue where if the existing file is removed, this one
      // won't come in to replace it.... hrm
      let shouldReplace = (
        !this.external[assetPath] ||
        this.external[assetPath].filename.length > filename.length
      );

      if (shouldReplace)
        this.external[assetPath] = {assetPath, filename};
    }

    let inlinePath = this.inlineAssetPath(filename);
    if (inlinePath) {
      this.inline[inlinePath] = {assetPath: inlinePath, filename};
    }

    // XXX would be nice to keep track of missing files in the dependency
    // tree and update as well

    this.emit('update', {add: [filename]});
  }


  assetPath(filename) {
    let cssRE = /(.*?)(\.css|\.less|[/\\]?index\.css|[/\\]?index\.less)$/;
    let jsRE = /(.*?)(\.js|\/?index\.dev\.js|\/?index\.js)$/;

    let assetPath = '';
    if (cssRE.test(filename))
      assetPath = filename.match(cssRE)[1] + '.css';
    else if (jsRE.test(filename))
      assetPath = filename.match(jsRE)[1] + '.js';
    else
      return null;

    if (assetPath[0] !== '.')
      assetPath = '/' + assetPath;

    // Windows backslash nightmare
    return this.name + assetPath.replace(RegExp(sep, 'g'), '/');
  }


  inlineAssetPath(filename) {
    let re = /(.*?)\.(svg|html|js)/;

    if (re.test(filename))
      return path.join(this.name, filename);
  }


}
