const logLevelsMap = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  verbose: 'verbose',
  debug: 'debug',
  silly: 'silly',
  audit: 'audit',
  trace: 'trace',
  perf: 'perf'
}

const logLevelValues = Object.values(logLevelsMap)

module.exports = {
  logLevelsMap,
  logLevelValues
}
