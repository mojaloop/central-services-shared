'use strict'

const winston = require('winston')

const level = process.env.LOG_LEVEL || 'info'

const transportConsole = new winston.transports.Console({ json: false, timestamp: true, prettyPrint: true, colorize: true, level: level })

const Logger = new (winston.Logger)({
  levels: {
    info: 0,
    warn: 1,
    error: 2,
    verbose: 3,
    debug: 4,
    silly: 5
  },
  transports: [
    transportConsole
  ],
  exceptionHandlers: [
    transportConsole
  ],
  exitOnError: false
})

module.exports = Logger
