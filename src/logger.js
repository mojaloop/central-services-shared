'use strict'

const winston = require('winston')

const level = process.env.LOG_LEVEL || 'info'

const transportConsole = new winston.transports.Console({ json: false, timestamp: true, prettyPrint: true, colorize: true, level: level })

const Logger = new (winston.Logger)({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    perf: 3,
    verbose: 4,
    debug: 5,
    silly: 6
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
