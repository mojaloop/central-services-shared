'use strict'

const winston = require('winston')

let Logger

if (!Logger) {
  const level = process.env.LOG_LEVEL || 'info'
  const filename = process.env.LOG_FILE_PATH_NAME || 'logs/combined.log'
  const transportFile = new winston.transports.File({
    json: false,
    timestamp: true,
    prettyPrint: true,
    colorize: true,
    filename: filename,
    level: level
  })

  Logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.colorize({all: true}),
      winston.format.timestamp({
        format: 'YYYY-MM-DD\'T\'HH:mm:ss.SSSZ'
      }),
      winston.format.prettyPrint(),
      winston.format.printf(info => `${info.timestamp} - ${info.level}: ${info.message}`)
    ),
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
      transportFile
    ],
    exceptionHandlers: [
      transportFile
    ],
    exitOnError: false
  })
}

module.exports = Logger
