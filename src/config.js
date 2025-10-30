const convict = require('convict')
const { logLevelsMap, logLevelValues } = require('./types')

const config = convict({
  logLevel: {
    doc: 'Log level for the library.',
    format: logLevelValues,
    default: logLevelsMap.warn,
    env: 'SHARED_CACHE_LOG_LEVEL'
  },

  defaultTtlSec: {
    doc: 'Default cache TTL.',
    format: Number,
    default: 300,
    env: 'SHARED_CACHE_DEFAULT_TTL_SEC'
  },
  httpRequestTimeoutMs: {
    doc: 'Timeout for HTTP requests in milliseconds.',
    format: Number,
    default: 20000,
    env: 'SHARED_HTTP_REQUEST_TIMEOUT_MS'
  }
})

config.validate({ allowed: 'strict' })

module.exports = config
