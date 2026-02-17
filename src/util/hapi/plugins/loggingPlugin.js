/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
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

 * Eugen Klymniuk <eugen.klymniuk@infitx.com>
 --------------
 **********/
/* istanbul ignore file */

const { env } = require('node:process')
const { asyncStorage } = require('@mojaloop/central-services-logger/src/contextLogger')
const { logger } = require('../../../logger')
const { incomingRequestAttributesDto } = require('../../otelDto')

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
        const requestId = request.info.id = `${request.info.id}__${request.headers[traceIdHeader]}`
        asyncStorage.enterWith({ requestId })

        if (shouldLog(request.path)) {
          logRequest(request, log)
        }
        return h.continue
      }
    })

    server.ext({
      type: 'onPreResponse',
      method: (request, h) => {
        if (shouldLog(request.path)) {
          logResponse(request, log)
        }
        return h.continue
      }
    })
  }
}

/**
 * @param {import('@hapi/hapi').Request} request
 * @param {ILogger} log
 * @returns OTelAttributes
 */
const logRequest = (request, log) => {
  log.info(`[==> req] ${reqDetails(request)}`, {
    headers: extractHeadersForLogs(request.headers),
    // payload is not parsed yet
    ...extractAttributes({ request })
  })
}

/**
 * @param {import('@hapi/hapi').Request} request
 * @param {ILogger} log
 * @returns OTelAttributes
 */
const logResponse = (request, log) => {
  const { response } = request

  const statusCode = response instanceof Error
    ? response.output?.statusCode
    : response?.statusCode

  const errorType = response instanceof Error
    ? response.output?.payload?.error
    : undefined

  const durationSec = (Date.now() - request.info.received) / 1000

  log.info(`[<== ${statusCode}] ${reqDetails(request)} ${durationSec}s`, {
    headers: extractHeadersForLogs(response?.output?.headers),
    payload: response?.output?.payload, // think if we need to log payload only with debug severity
    ...extractAttributes({ request, durationSec, statusCode, errorType })
  })
}

const extractAttributes = ({ request, durationSec, statusCode, errorType }) => {
  return incomingRequestAttributesDto({
    method: request.method,
    path: request.path,
    url: getFullUrl(request),
    route: request.route.path,
    serverAddress: request.info.hostname,
    clientAddress: request.info.remoteAddress,
    userAgent: request.headers['user-agent'],
    requestId: request.info.id,
    durationSec,
    statusCode,
    errorType
  })
}

/** @param {import('@hapi/hapi').Request} req */
const getFullUrl = (req) => {
  const search = req.url?.search || ''
  return `${req.server.info.protocol}://${req.info.host}${req.path}${search}`
}

const extractHeadersForLogs = (headers = {}) => {
  // todo: add impl.
  return headers
}

const reqDetails = (request) => {
  const reqCounter = request.info.id?.split('__')[0].split(':').pop() || 'N/A'
  return `${request.method.toUpperCase()} ${request.path}  [${reqCounter}]`
}

module.exports = loggingPlugin
