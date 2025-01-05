/*****
 License
 --------------
 Copyright © 2020-2024 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>
 * Infitx
 - Kevin Leyow <kevin.leyow@infitx.com>
 --------------
 ******/

const ErrorHandler = require('@mojaloop/central-services-error-handling')
const Metrics = require('@mojaloop/central-services-metrics')

const { logger } = require('../logger')

/**
 * Rethrows an FSPIOP error after logging it and incrementing an error counter.
 *
 * @param {Error} error - The error to be rethrown.
 * @param {Object} [options={}] - Optional parameters.
 * @param {string} [options.operation] - The operation during which the error occurred.
 * @param {string} [options.step] - The step during which the error occurred.
 * @param {Object} [options.loggerOverride] - An optional logger to override the default logger.
 * @throws {Error} - Throws the reformatted FSPIOP error.
 */
const rethrowAndCountFspiopError = (error, options = {}) => {
  const { operation, step, loggerOverride } = options
  const log = loggerOverride || logger
  log.error(error)

  const fspiopError = ErrorHandler.Factory.reformatFSPIOPError(error)
  const extensions = fspiopError.extensions || []
  const system = extensions.find((element) => element.key === 'system')?.value || ''

  try {
    const errorCounter = Metrics.getCounter('errorCount')
    errorCounter.inc({
      code: fspiopError?.apiErrorCode.code,
      system,
      operation,
      step
    })
  } catch (error) {
    log.error('Metrics error counter not initialized', error)
  }

  log.error(`rethrowFspiopError: ${error?.message}`, { fspiopError })
  throw fspiopError
}

const constructSystemExtensionError = (error, system) => {
  const extensions = [{
    key: 'system',
    value: system
  }]
  return ErrorHandler.Factory.reformatFSPIOPError(
    error,
    undefined,
    undefined,
    extensions
  )
}

const rethrowError = (error, options = {}, system) => {
  const { loggerOverride } = options
  const log = loggerOverride || logger
  log.error(error)
  throw constructSystemExtensionError(error, system)
}

const rethrowDatabaseError = (error, options = {}) => {
  rethrowError(error, options, '["db"]')
}

const rethrowCachedDatabaseError = (error, options = {}) => {
  rethrowError(error, options, '["db","cache"]')
}

const rethrowRedisError = (error, options = {}) => {
  rethrowError(error, options, '["redis"]')
}

const rethrowKafkaError = (error, options = {}) => {
  rethrowError(error, options, '["kafka"]')
}

const rethrowCacheError = (error, options = {}) => {
  rethrowError(error, options, '["cache"]')
}

module.exports = {
  rethrowAndCountFspiopError,
  rethrowDatabaseError,
  rethrowCachedDatabaseError,
  rethrowRedisError,
  rethrowKafkaError,
  rethrowCacheError,
  constructSystemExtensionError
}
