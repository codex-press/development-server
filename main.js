#! /usr/bin/env node

var cluster = require('cluster')
var selfupdate = require('selfupdate')
var yargs = require('yargs-parser')
var chalk = require('chalk')

var package = require('./package.json')
var argv = require('yargs').argv

var log = function(text) { console.log(chalk.magenta(text)) }

if (cluster.isMaster) {

  selfupdate.isUpdated(package, (error, isUpdated) => {
    if (isUpdated)
      cluster.fork()
    else {
      log('Updating to the latest version...')
      selfupdate.update(package, (error, version) => {
        if (error)
          log('Error updating package: ' + error.message)
        else if (version !== undefined)
          log('The package was updated to version: ' + version)
        cluster.fork()
      })
    }
  })

  cluster.on('exit', function(worker, code, signal) {
    cluster.fork()
  })

}


if (cluster.isWorker) {
  var path = require('path')
  process.chdir(path.dirname(require.main.filename))
  process.env.NODE_ENV = 'production'
  process.env.CP_PORT = argv.port
  process.env.CP_OPEN = (argv.open != false)
  require('./build/server/app.js')
}


