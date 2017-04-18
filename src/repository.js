import EventEmitter from 'events';
import path from 'path';
import fs from 'fs';
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

    this.assets = {};
    this.inlineAssets = {};
    this.dependencies = {};

    this.loadConfig();
    this.watch();
  }


  loadConfig() {
    try {
      this.config = JSON.parse(fs.readFileSync(this.path + '/package.json')).codex
    }
    catch (e) {
      if (e.code !== 'ENOENT') console.error(e);
    }

    this.config = this.config || {'babel':['*.js']};
  }


  has(assetPath) {
    return !!this.assets[assetPath];
  }


  hasInline(assetPath) {

  }


  code(assetPath) {
    let asset = this.assets[assetPath];

    if (!asset)
      return Promise.resolve('not found!');

    // check if it should be transpiled at all...
    // might just read the file with fs-promise

    if (/\.js/.test(assetPath))
      return js(asset.filename, this.path, assetPath);
    else if (/\.css/.test(assetPath)) {
      return css(asset.filename, this.path, assetPath)
      .then(({dependencies, code}) => {
        this.dependencies[assetPath] = dependencies;
        return code;
      });
    }

  }


  filename(assetPath) {
    return this.assets[assetPath].filename;
  }


  inlineFilename(assetPath) {
    return this.inlieAssets[assetPath].filename;
  }


  watch() {
    let ignored = /node_modules|(^|[\/\\])\../;
    let path = this.path + '**/*@(js|css|less|svg|html)';
    this.watcher = chokidar.watch(path, { ignored })
      .add(this.path + '/package.json')
      .on('add', path => this.add(path))
      .on('ready', () => this.emit('ready'))
      .on('change', path => this.change(path))
      .on('unlink', path => this.remove(path));
  }


  change(filename) {
    filename = filename.slice(this.path.length + 1);

    if (filename === 'package.json') {
      this.loadConfig();
      return;
    }

    // uses dependency tree to get all assetPaths being updated

    this.emit('update', {change: [filename]});
  }


  remove(filename) {

    // uses dependency tree to get all assetPaths being updated

    this.emit('update', {remove: [filename]});
  }


  add(filename) {
    filename = filename.slice(this.path.length + 1);

    let assetPath = this.assetPath(filename);
    if (assetPath) {
      this.assets[assetPath] = {assetPath, filename};
    }

    let inlinePath = this.inlineAssetPath(filename);
    if (inlinePath) {
      this.inlineAssets[inlinePath] = {assetPath: inlinePath, filename};
    }

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
      return this.name + filename;
  }


}
