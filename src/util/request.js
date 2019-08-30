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

 --------------
 ******/
'use strict'

const EventSdk = require('@mojaloop/event-sdk')
const request = require('axios')
const Logger = require('../logger')
const Headers = require('./headers/transformer')
const enums = require('../enums')
const ErrorHandler = require('@mojaloop/central-services-error-handling')

const MISSING_FUNCTION_PARAMETERS = 'Missing parameters for function'

/**
 * @function validateParticipant
 *
 * @description sends a request to url
 *
 * @param {string} url the endpoint for the service you require
 * @param {object} headers the http headers
 * @param {string} method http method being requested i.e. GET, POST, PUT
 * @param {string} source id for which callback is being sent from
 * @param {string} destination id for which callback is being sent
 * @param {object} payload the body of the request being sent
 * @param {string} responseType the type of the response object
 * @param {object} span a span for event logging if this request is within a span
 *
 *@return {object} The response for the request being sent or error object with response included
 */
const sendRequest = async (url, headers, source, destination, method = enums.Http.RestMethods.GET, payload = undefined, responseType = enums.Http.Headers.DEFAULT.APPLICATION_JSON, span = undefined) => {
  let requestOptions
  if (!url || !method || !headers || (method !== enums.Http.RestMethods.GET && !payload) || !source || !destination) {
    throw ErrorHandler.Factory.createInternalServerFSPIOPError(MISSING_FUNCTION_PARAMETERS)
  }
  try {
    const transformedHeaders = Headers.transformHeaders(headers, {
      httpMethod: method,
      sourceFsp: source,
      destinationFsp: destination
    })
    requestOptions = {
      url,
      method: method,
      headers: transformedHeaders,
      data: payload,
      responseType
    }
    if (span) {
      requestOptions = span.injectContextToHttpRequest(requestOptions)
      span.audit(requestOptions, EventSdk.AuditEventAction.egress)
    }
    Logger.info(`sendRequest::request ${JSON.stringify(requestOptions)}`)
    const response = await request(requestOptions)
    Logger.info(`Success: sendRequest::response ${JSON.stringify(response, Object.getOwnPropertyNames(response))}`)
    return response
  } catch (error) {
    Logger.error(error)
    throw ErrorHandler.Factory.createFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_COMMUNICATION_ERROR, 'Failed to send HTTP request to host', error, source, [
      { key: 'url', value: url },
      { key: 'sourceFsp', value: source },
      { key: 'destinationFsp', value: destination },
      { key: 'method', value: method },
      { key: 'request', value: JSON.stringify(requestOptions) }
    ])
  }
}

module.exports = {
  sendRequest
}
