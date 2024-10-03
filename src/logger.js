const { loggerFactory } = require('@mojaloop/central-services-logger/src/contextLogger')

const logger = loggerFactory('CSSh') // global logger

module.exports = {
  logger,
  loggerFactory
}
