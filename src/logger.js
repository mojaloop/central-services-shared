'use strict'

const { createLogger, format, transports } = require('winston')
const { combine, timestamp, colorize, printf } = format
const level = process.env.LOG_LEVEL || 'info'

const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} - ${level}: ${message}`
})

const Logger = createLogger({
  level,
  levels: {
    error: 0,
    warn: 1,
    audit: 2,
    trace: 3,
    info: 4,
    perf: 5,
    verbose: 6,
    debug: 7,
    silly: 8
  },
  format: combine(
    timestamp(),
    colorize({
      colors: {
        audit: 'magenta',
        trace: 'white',
        perf: 'green'
      }
    }),
    customFormat
  ),
  transports: [
    new transports.Console()
  ],
  exceptionHandlers: [
    new transports.Console()
  ],
  exitOnError: false
})

module.exports = Logger
