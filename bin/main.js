#! /usr/bin/env node

var cluster = require('cluster');
var path = require('path');

if (cluster.isMaster) {
  cluster.fork();

  console.log('hiya');

  cluster.on('exit', function(worker, code, signal) {
    cluster.fork();
  });
}

if (cluster.isWorker) {
  process.chdir(path.dirname(require.main.filename) + '/..')
  require('../build/app.js');
}


