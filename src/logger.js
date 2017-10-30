'use strict'

const Winston = require('winston')

function Logger () {
  this._logger = new Winston.Logger().add(Winston.transports.Console, { timestamp: true, colorize: true })
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

Logger.prototype.log = function (...args) {
  this._logger.log(...args)
}

Logger.prototype.Logger = Logger

module.exports = new Logger()
