#! /usr/bin/env node

const cluster = require('cluster');
const path = require('path');
const selfupdate = require('selfupdate');
const yargs = require('yargs-parser');
const chalk = require('chalk');

const package = require('./package.json');
const argv = require('yargs').argv

if (cluster.isMaster) {
  cluster.fork();

  selfupdate.update(package, (error, version) => {
    if (version === undefined)
      console.log(chalk.magenta('Server up to date with version: ' + package.version));
    else if (error)
      console.log(chalk.magenta('Error updating package: ' + error.message));
    else if (version !== undefined)
      console.log(chalk.magenta('The package was updated to version: ' + version));
  });

  cluster.on('exit', function(worker, code, signal) {
    cluster.fork();
  });
}

if (cluster.isWorker) {
  process.chdir(path.dirname(require.main.filename) + '/..')
  process.env.NODE_ENV = 'production';
  process.env.CP_PORT = argv.port;
  process.env.CP_OPEN = (argv.open != false);
  require('./build/server/app.js');
}


