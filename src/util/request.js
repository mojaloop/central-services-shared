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

 * Rajiv Mothilal <rajiv.mothilal@modusbox.com>
 * Shashikant Hirugade <shashikant.hirugade@modusbox.com>

 --------------
 ******/
'use strict'

const { env } = require('node:process')
const http = require('node:http')
const axios = require('axios')
const axiosRetry = require('axios-retry')
const stringify = require('fast-safe-stringify')
const EventSdk = require('@mojaloop/event-sdk')
const ErrorHandler = require('@mojaloop/central-services-error-handling')
const Metrics = require('@mojaloop/central-services-metrics')

const Headers = require('./headers/transformer')
const enums = require('../enums')
const { logger } = require('../logger')
const { API_TYPES } = require('../constants')

const MISSING_FUNCTION_PARAMETERS = 'Missing parameters for function'

// Delete the default headers that the `axios` module inserts as they can brake our conventions.
// By default it would insert `"Accept":"application/json, text/plain, */*"`.
delete axios.defaults.headers.common.Accept

const keepAlive = (env.HTTP_AGENT_KEEP_ALIVE ?? 'true') === 'true'
const TIMEOUT = env.HTTP_REQUEST_TIMEOUT_MS ? parseInt(env.HTTP_REQUEST_TIMEOUT_MS, 10) : 25_000
const RETRY_COUNT = env.HTTP_RETRY_COUNT ? parseInt(env.HTTP_RETRY_COUNT, 10) : 0
const RETRY_DELAY = env.HTTP_RETRY_DELAY_MS ? parseInt(env.HTTP_RETRY_DELAY_MS, 10) : 100
logger.info('http keepAlive, RETRY_COUNT and TIMEOUT:', { keepAlive, RETRY_COUNT, TIMEOUT })

// Enable keepalive for http
axios.defaults.httpAgent = new http.Agent({ keepAlive })
axios.defaults.httpAgent.toJSON = () => ({})

if (RETRY_COUNT > 0) axiosRetry.default(axios, createHttpRetryConfig())
// think, if we need to be able to set retry per request

/**
 * @function sendRequest
 *
 * @description sends a request to url
 *
 * @typedef SendRequestProtocolVersions
 * @type {object}
 * @property {string} content - protocol version to be used in the ContentType HTTP Header.
 * @property {string} accept - protocol version to be used in the Accept HTTP Header.
 *
 * @param {string} url the endpoint for the service you require
 * @param {object} headers the http headers
 * @param {string} method http method being requested i.e. GET, POST, PUT
 * @param {string} source id for which callback is being sent from
 * @param {string} destination id for which callback is being sent
 * @param {object | undefined} payload the body of the request being sent
 * @param {object | null} params URL parameters to be sent with the request. Must be a plain object, URLSearchParams object or null/undefined
 * @param {string} responseType the type of the response object
 * @param {object | undefined} span a span for event logging if this request is within a span
 * @param {object | undefined} jwsSigner the jws signer for signing the requests
 * @param {SendRequestProtocolVersions | undefined} protocolVersions the config for Protocol versions to be used
 * @param {'fspiop' | 'iso20022'} apiType the API type of the request being sent
 * @param {object} axiosRequestOptionsOverride axios request options to override https://axios-http.com/docs/req_config
 * @param {ContextLogger} log instance of ContextLogger
 * @param {regex} hubNameRegex hubName Regex
 *
 *@return {Promise<any>} The response for the request being sent or error object with response included
 */

const sendRequest = async ({
  url,
  headers,
  source,
  destination,
  method = enums.Http.RestMethods.GET,
  payload = undefined,
  params,
  responseType = enums.Http.ResponseTypes.JSON,
  span = undefined,
  jwsSigner = undefined,
  protocolVersions = undefined,
  apiType = API_TYPES.fspiop,
  axiosRequestOptionsOverride = defaultAxiosConfig(),
  log = logger.child({ component: 'CSSh-request' }),
  hubNameRegex
}) => {
  const histTimerEnd = Metrics.getHistogram(
    'sendRequest',
    `sending ${method} request to: ${url} from: ${source} to: ${destination}`,
    ['success', 'source', 'destination', 'method']
  ).startTimer()
  let sendRequestSpan
  if (span) {
    sendRequestSpan = span.getChild(`${span.getContext().service}_sendRequest`)
    sendRequestSpan.setTags({ source, destination, method, url })
  }
  let requestOptions
  if (!url || !method || !headers || (method !== enums.Http.RestMethods.GET && method !== enums.Http.RestMethods.DELETE && !payload) || !source || !hubNameRegex) {
    // think, if we can just avoid checking "destination"
    throw ErrorHandler.Factory.createInternalServerFSPIOPError(MISSING_FUNCTION_PARAMETERS)
  }
  try {
    const transformedHeaders = Headers.transformHeaders(headers, {
      httpMethod: method,
      sourceFsp: source,
      destinationFsp: destination,
      protocolVersions,
      hubNameRegex,
      apiType
    })
    requestOptions = {
      ...axiosRequestOptionsOverride,
      url,
      method,
      headers: transformedHeaders,
      data: payload, // todo: think, if it's better to transform to ISO format here (based on apiType)
      params,
      responseType
    }
    // if jwsSigner is passed then sign the request
    if (jwsSigner != null && typeof (jwsSigner) === 'object') {
      requestOptions.headers['fspiop-signature'] = jwsSigner.getSignature(requestOptions)
    }

    if (span) {
      requestOptions = span.injectContextToHttpRequest(requestOptions)
      const { data, httpAgent, ...rest } = requestOptions
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload)
        } catch (e) {
          // do nothing
        }
      }
      span.audit({ ...rest, payload }, EventSdk.AuditEventAction.egress)
    }
    log.debug('sendRequest::requestOptions:', { requestOptions })
    const response = await axios(requestOptions)

    !!sendRequestSpan && await sendRequestSpan.finish()
    histTimerEnd({ success: true, source, destination, method })
    return response
  } catch (error) {
    log.error('error in request.sendRequest:', {
      code: error.code,
      message: error.message,
      stack: error.stack,
      method,
      url,
      source,
      destination,
      status: error.response?.status,
      data: error.response?.data
    })

    // Check if this is an HTTP response error (4xx or 5xx) vs a network/connection error
    if (error.response) {
      // For HTTP errors, check if the response contains FSPIOP error information
      const responseData = error.response.data

      // If the response contains a valid errorInformation object, use it directly
      if (responseData?.errorInformation) {
        const fspiopError = ErrorHandler.Factory.createFSPIOPErrorFromErrorInformation(responseData.errorInformation)
        if (sendRequestSpan) {
          const state = new EventSdk.EventStateMetadata(EventSdk.EventStatusType.failed, fspiopError.apiErrorCode.code, fspiopError.apiErrorCode.message)
          await sendRequestSpan.error(fspiopError, state)
          await sendRequestSpan.finish(fspiopError.message, state)
        }
        histTimerEnd({ success: false, source, destination, method })
        throw fspiopError
      }

      // For other 4xx errors without errorInformation, create appropriate FSPIOP error
      if (error.response.status >= 400 && error.response.status < 500) {
        let errorCode = ErrorHandler.Enums.FSPIOPErrorCodes.CLIENT_ERROR
        let errorMessage = 'Client error'

        // Map specific HTTP status codes to FSPIOP error codes
        if (error.response.status === 400) {
          errorCode = ErrorHandler.Enums.FSPIOPErrorCodes.CLIENT_ERROR
          errorMessage = responseData?.message || 'Bad Request'
        } else if (error.response.status === 404) {
          errorCode = ErrorHandler.Enums.FSPIOPErrorCodes.ID_NOT_FOUND
          errorMessage = responseData?.message || 'The requested resource could not be found'
        } else if (error.response.status === 403) {
          errorCode = ErrorHandler.Enums.FSPIOPErrorCodes.CLIENT_ERROR
          errorMessage = responseData?.message || 'Permission denied'
        }

        const extensions = [
          { key: 'url', value: url },
          { key: 'status', value: error.response.status },
          { key: 'response', value: stringify(responseData) }
        ]

        const fspiopError = ErrorHandler.Factory.createFSPIOPError(errorCode, errorMessage, error, source, extensions)
        if (sendRequestSpan) {
          const state = new EventSdk.EventStateMetadata(EventSdk.EventStatusType.failed, fspiopError.apiErrorCode.code, fspiopError.apiErrorCode.message)
          await sendRequestSpan.error(fspiopError, state)
          await sendRequestSpan.finish(fspiopError.message, state)
        }
        histTimerEnd({ success: false, source, destination, method })
        throw fspiopError
      }
    }

    // For network errors or 5xx errors, use DESTINATION_COMMUNICATION_ERROR
    const extensionArray = [
      { key: 'url', value: url },
      { key: 'sourceFsp', value: source },
      { key: 'destinationFsp', value: destination },
      { key: 'method', value: method },
      { key: 'request', value: stringify(requestOptions) },
      { key: 'errorMessage', value: error.message }
    ]
    const extensions = []
    if (error.response) {
      extensionArray.push({ key: 'status', value: error.response?.status })
      extensionArray.push({ key: 'response', value: error.response?.data })
      extensions.push({ key: 'status', value: error.response?.status })
    }
    const cause = stringify(extensionArray)
    extensions.push({ key: 'cause', value: cause })
    const fspiopError = ErrorHandler.Factory.createFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_COMMUNICATION_ERROR, 'Failed to send HTTP request to host', error, source, extensions)
    if (sendRequestSpan) {
      const state = new EventSdk.EventStateMetadata(EventSdk.EventStatusType.failed, fspiopError.apiErrorCode.code, fspiopError.apiErrorCode.message)
      await sendRequestSpan.error(fspiopError, state)
      await sendRequestSpan.finish(fspiopError.message, state)
    }
    histTimerEnd({ success: false, source, destination, method })
    throw fspiopError
  }
}

// See more options here: https://axios-http.com/docs/req_config
const defaultAxiosConfig = () => Object.freeze({
  timeout: TIMEOUT,
  // validateStatus: status => (status >= 200 && status < 300), // default
  transitional: {
    clarifyTimeoutError: true // to set ETIMEDOUT error code on timeout instead of ECONNABORTED
  }
})

const retryableStatusCodes = [
  // 408,
  // 429,
  // 502,
  503
]

const retryableHttpErrorCodes = [
  // 'ETIMEDOUT',
  'EAI_AGAIN'
]

// See all retry options here: https://github.com/softonic/axios-retry?tab=readme-ov-file#options
function createHttpRetryConfig () {
  return {
    retries: RETRY_COUNT,
    retryCondition: (err) => {
      const needRetry = retryableStatusCodes.includes(err.status) ||
        retryableHttpErrorCodes.includes(err.code)
      // axiosRetry.isNetworkOrIdempotentRequestError(err) ||
      // axiosRetry.isRetryableError(err)
      logger.debug(`retryCondition is evaluated to ${needRetry}`, formatAxiosError(err))
      return needRetry
    },
    retryDelay: (retryCount) => {
      logger.debug('http retryDelay...', { RETRY_DELAY, retryCount })
      return RETRY_DELAY
    },
    onRetry: (retryCount, err) => {
      logger.verbose(`retrying HTTP request...  [reason: ${err?.message}]`, formatAxiosError(err, retryCount))
    },
    onMaxRetryTimesExceeded: (err, retryCount) => {
      logger.info('max retries exceeded for HTTP request!', formatAxiosError(err, retryCount))
    }
  }
}

const formatAxiosError = (error, retryCount) => {
  const { message, code, status, response } = error

  return {
    message,
    code,
    status,
    ...(response?.data && { errorResponseData: response.data }),
    ...(retryCount && { retryCount })
  }
}

module.exports = {
  sendRequest
}
