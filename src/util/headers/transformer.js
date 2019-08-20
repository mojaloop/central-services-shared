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

 * Georgi Georgiev <georgi.georgiev@modusbox.com> : sourced from ml-api-adapter
 * Miguel de Barros <miguel.debarros@modusbox.com>
 --------------
 ******/

'use strict'

const ENUM = require('../../enums').Http
const ErrorHandler = require('@mojaloop/central-services-error-handling')

/**
 * @module src/headers/transformer
 */

/**
* @function transformHeaders
*
* @description This will transform the headers before sending to kafka
* NOTE: Assumes incoming headers keys are lowercase. This is a safe
* assumption only if the headers parameter comes from node default http framework.
*
* see https://nodejs.org/dist/latest-v10.x/docs/api/http.html#http_message_headers
*
* @param {object} headers - the http header from the request
*
* @returns {object} Returns the normalized headers
*/

const transformHeaders = (headers, config) => {
  // Normalized keys
  const normalizedKeys = Object.keys(headers).reduce(
    function (keys, k) {
      keys[k.toLowerCase()] = k
      return keys
    }, {})

  // Normalized headers
  const normalizedHeaders = {}

  // check to see if FSPIOP-Destination header has been left out of the initial request. If so then add it.
  if (!normalizedKeys[ENUM.Headers.FSPIOP.DESTINATION]) {
    headers[ENUM.Headers.FSPIOP.DESTINATION] = ''
  }

  for (const headerKey in headers) {
    const headerValue = headers[headerKey]
    let tempDate
    switch (headerKey.toLowerCase()) {
      case (ENUM.Headers.GENERAL.DATE):
        if (typeof headerValue === 'object' && headerValue instanceof Date) {
          tempDate = headerValue.toUTCString()
        } else {
          try {
            tempDate = (new Date(headerValue)).toUTCString()
            if (tempDate === 'Invalid Date') {
              throw ErrorHandler.Factory.createInternalServerFSPIOPError('Invalid Date')
            }
          } catch (err) {
            tempDate = headerValue
          }
        }
        normalizedHeaders[headerKey] = tempDate
        break
      case (ENUM.Headers.GENERAL.CONTENT_LENGTH || ENUM.Headers.GENERAL.HOST):
        // Do nothing here, do not map. This will be inserted correctly by the Hapi framework.
        break
      case (ENUM.Headers.FSPIOP.HTTP_METHOD):
        // Check to see if we find a regex match the source header containing the switch name.
        // If so we include the signature otherwise we remove it.
        if (headers[normalizedKeys[ENUM.Headers.FSPIOP.SOURCE]].match(ENUM.Headers.FSPIOP.SWITCH.regex) === null) {
          if (config.httpMethod.toLowerCase() === headerValue.toLowerCase()) {
            // HTTP Methods match, and thus no change is required
            normalizedHeaders[headerKey] = headerValue.toUpperCase()
          } else {
            // HTTP Methods DO NOT match, and thus a change is required for target HTTP Method
            normalizedHeaders[headerKey] = config.httpMethod.toUpperCase()
          }
        } else {
          if (config.httpMethod.toLowerCase() === headerValue.toLowerCase()) {
            // HTTP Methods match, and thus no change is required
            normalizedHeaders[headerKey] = headerValue.toUpperCase()
          } else {
            // HTTP Methods DO NOT match, and thus a change is required for target HTTP Method
            normalizedHeaders[headerKey] = config.httpMethod.toUpperCase()
          }
        }
        break
      case (ENUM.Headers.FSPIOP.SOURCE):
        normalizedHeaders[headerKey] = config.sourceFsp
        break
      case (ENUM.Headers.FSPIOP.DESTINATION):
        normalizedHeaders[headerKey] = config.destinationFsp
        break
      default:
        normalizedHeaders[headerKey] = headerValue
    }
  }

  if (normalizedHeaders[normalizedKeys[ENUM.Headers.FSPIOP.SOURCE]].match(ENUM.Headers.FSPIOP.SWITCH.regex) !== null) {
    // Check to see if we find a regex match the source header containing the switch name.
    // If so we remove the signature added by default.
    delete normalizedHeaders[normalizedKeys[ENUM.Headers.FSPIOP.SIGNATURE]]
    // Also remove FSPIOP-URI and make FSPIOP-HTTP-Method ALL-CAPS #737
    delete normalizedHeaders[normalizedKeys[ENUM.Headers.FSPIOP.URI]]
  }

  if (config && config.httpMethod !== ENUM.RestMethods.POST) {
    delete normalizedHeaders[ENUM.Headers.GENERAL.ACCEPT.value]
  }
  return normalizedHeaders
}

module.exports = {
  transformHeaders
}
