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

 * Rajiv Mothilal <rajiv.mothilal@modusbox.com>
 * Shashikant Hirugade <shashikant.hirugade@modusbox.com>

 --------------
 ******/
'use strict'

const http = require('node:http')
const request = require('axios')
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
delete request.defaults.headers.common.Accept

// Enable keepalive for http
request.defaults.httpAgent = new http.Agent({ keepAlive: true })
request.defaults.httpAgent.toJSON = () => ({})

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
  axiosRequestOptionsOverride = {},
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
      url,
      method,
      headers: transformedHeaders,
      data: payload, // todo: think, if it's better to transform to ISO format here (based on apiType)
      params,
      responseType,
      httpAgent: new http.Agent({ keepAlive: true }),
      ...axiosRequestOptionsOverride
    }
    // if jwsSigner is passed then sign the request
    if (jwsSigner != null && typeof (jwsSigner) === 'object') {
      requestOptions.headers['fspiop-signature'] = jwsSigner.getSignature(requestOptions)
    }

    if (span) {
      requestOptions = span.injectContextToHttpRequest(requestOptions)
      span.audit(requestOptions, EventSdk.AuditEventAction.egress)
    }
    logger.debug('sendRequest::requestOptions:', { requestOptions })
    const response = await request(requestOptions)

    !!sendRequestSpan && await sendRequestSpan.finish()
    histTimerEnd({ success: true, source, destination, method })
    return response
  } catch (error) {
    logger.warn('error in request.sendRequest:', error)
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

module.exports = {
  sendRequest
}
