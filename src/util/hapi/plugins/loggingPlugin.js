/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Eugen Klymniuk <eugen.klymniuk@infitx.com>
 --------------
 **********/
/* istanbul ignore file */

const { env } = require('node:process')
const { asyncStorage } = require('@mojaloop/central-services-logger/src/contextLogger')
const { logger } = require('../../../logger')

const INTERNAL_ROUTES = env.LOG_INTERNAL_ROUTES ? env.LOG_INTERNAL_ROUTES.split(',') : ['/health', '/metrics', '/live']
const TRACE_ID_HEADER = env.LOG_TRACE_ID_HEADER ?? 'traceid'

const loggingPlugin = {
  name: 'loggingPlugin',
  version: '1.0.0',
  once: true,

  /** @typedef {import('@hapi/hapi').Server} HapiServer */
  /** @typedef {import('@mojaloop/central-services-logger/src/contextLogger').ILogger} ILogger */
  /**
   * Registers the logging plugin with the Hapi server.
   * @param {HapiServer} server - The Hapi server instance.
   * @param {Object} [options={}] - Optional configuration for the plugin.
   * @param {ILogger} [options.log=logger] - ContextLogger instance to use for logging.
   * @param {string[]} [options.internalRoutes=INTERNAL_ROUTES] - Routes to exclude from logging.
   * @param {string} [options.traceIdHeader=TRACE_ID_HEADER] - Header name for trace ID.
   */
  register: async (server, options = {}) => {
    const {
      log = logger,
      internalRoutes = INTERNAL_ROUTES,
      traceIdHeader = TRACE_ID_HEADER
    } = options

    const shouldLog = (path) => log.isInfoEnabled && !internalRoutes.includes(path)

    server.ext({
      type: 'onRequest',
      method: (request, h) => {
        const { path, method, headers, payload, query } = request
        const { remoteAddress } = request.info
        const requestId = request.info.id = `${request.info.id}__${headers[traceIdHeader]}`
        asyncStorage.enterWith({ requestId })

        if (shouldLog(path)) {
          log.info(`[==> req] ${method.toUpperCase()} ${path}`, { headers, payload, query, remoteAddress })
        }
        return h.continue
      }
    })

    server.ext({
      type: 'onPreResponse',
      method: (request, h) => {
        if (shouldLog(request.path)) {
          const { path, method, payload, response } = request
          const { received } = request.info

          const statusCode = response instanceof Error
            ? response.output?.statusCode
            : response.statusCode
          const respTimeSec = ((Date.now() - received) / 1000).toFixed(1)

          log.info(`[<== ${statusCode}] ${method.toUpperCase()} ${path} [${respTimeSec} sec]`, { payload })
        }
        return h.continue
      }
    })
  }
}

module.exports = loggingPlugin
