'use strict'

const Winston = require('winston')

function Logger () {
  this._logger = new Winston.Logger().add(Winston.transports.Console, { timestamp: true, colorize: true })

  this._logger.level = 'debug'

  const levels = {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4,
    silly: 5
  }
}

Logger.prototype.debug = function (...args) {
  this.log('debug', ...args)
}

Logger.prototype.info = function (...args) {
  this.log('info', ...args)
}

Logger.prototype.warn = function (...args) {
  this.log('warn', ...args)
}

Logger.prototype.error = function (...args) {
  this.log('error', ...args)
}

Logger.prototype.verbose = function (...args) {
  this.log('verbose', ...args)
}

Logger.prototype.silly = function (...args) {
  this.log('silly', ...args)
}

Logger.prototype.log = function (...args) {
  this._logger.log(...args)
}

Logger.prototype.Logger = Logger

module.exports = new Logger()
