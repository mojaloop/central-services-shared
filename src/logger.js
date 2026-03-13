const { loggerFactory, allLevels } = require('@mojaloop/central-services-logger/src/contextLogger')

const logger = loggerFactory('CSSh') // global logger

module.exports = {
  logger,
  logLevelsMap: Object.fromEntries(Object.keys(allLevels).map(k => [k, k]))
}
