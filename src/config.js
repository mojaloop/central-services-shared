const convict = require('convict')
const { logLevelsMap } = require('./logger')

const config = convict({
  logLevelRedis: {
    doc: 'Log level for Redis components.',
    format: Object.values(logLevelsMap),
    default: logLevelsMap.warn,
    env: 'LOG_LEVEL_REDIS'
  },

  logLevelHttp: {
    doc: 'Log level for HTTP wrapper.',
    format: Object.values(logLevelsMap),
    default: logLevelsMap.warn,
    env: 'LOG_LEVEL_HTTP'
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
