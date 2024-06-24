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

const resourceVersions = require('../helpers').resourceVersions

/**
 * @module src/headers/transformer
 */

const regexForContentAndAcceptHeaders = /(application\/vnd\.interoperability\.)(\w*)+(\+json\s{0,1};\s{0,1}version=)(.*)/

/**
* @function getResourceInfoFromHeader
*
* @description This will parse either a FSPIOP Content-Type or Accept header and return an object containing the resourceType and applicable version
*
* @typedef ResourceInfo
* @type {object}
* @property {string} resourceType - resource parsed from the headerValue.
* @property {string} version - version parsed from the headerValue.
*
* @param {string} headerValue - the http header from the request, thus must be either an FSPIOP Content-Type or Accept header.
*
* @returns {ResourceInfo} Returns resourceInfo object. If the headerValue was not parsed correctly, an empty object {} will be returned.
*/
const getResourceInfoFromHeader = (headerValue) => {
  const result = {}
  const regex = regexForContentAndAcceptHeaders.exec(headerValue)
  if (regex) {
    if (regex[2]) result.resourceType = regex[2]
    if (regex[4]) result.version = regex[4]
  }
  return result
}

/**
* @function transformHeaders
*
* @description This will transform the headers before sending to kafka
* NOTE: Assumes incoming headers keys are lowercase. This is a safe
* assumption only if the headers parameter comes from node default http framework.
*
* see https://nodejs.org/dist/latest-v10.x/docs/api/http.html#http_message_headers
*
* @typedef TransformProtocolVersions
* @type {object}
* @property {string} content - protocol version to be used in the ContentType HTTP Header.
* @property {string} accept - protocol version to be used in the Accept HTTP Header.
*
* @typedef TransformHeadersConfig
* @type {object}
* @property {string} contentType - HTTP method such as "POST", "PUT", etc.
* @property {string} accept - Source FSP Identifier.
* @property {string} destinationFsp - Destination FSP Identifier.
* @property {TransformProtocolVersions} protocolVersions - Config for Protocol versions to be used.
*
* Config supports the following parameters:
*  config: {
*    httpMethod: string,
*    sourceFsp: string,
*    destinationFsp: string,
*    protocolVersions: {
*      content: string,
*      accept: string
*    }
*  }
*
* @param {object} headers - the http header from the request
* @param {TransformHeadersConfig} headers - the http header from the request
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

  // resource type for content-type and accept headers
  let resourceType
  let acceptVersion
  let contentVersion

  // Determine the acceptVersion using the injected config
  if (config && config.protocolVersions && config.protocolVersions.accept) acceptVersion = config.protocolVersions.accept

  // Determine the contentVersion using the injected config
  if (config && config.protocolVersions && config.protocolVersions.content) contentVersion = config.protocolVersions.content

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
      case (ENUM.Headers.GENERAL.CONTENT_LENGTH):
        // Do nothing here, do not map. This will be inserted correctly by the Axios library
        break
      case (ENUM.Headers.GENERAL.HOST):
        // Do nothing here, do not map. This will be inserted correctly by the Axios library
        break
      case (ENUM.Headers.FSPIOP.HTTP_METHOD):
        // Check to see if we find a regex match the source header containing the switch name.
        // If so we include the signature otherwise we remove it.
        if (headers[normalizedKeys[ENUM.Headers.FSPIOP.SOURCE]].match(config.hubNameRegex) === null) {
          if (config.httpMethod.toLowerCase() === headerValue.toLowerCase()) {
            // HTTP Methods match, and thus no change is required
            normalizedHeaders[headerKey] = headerValue
          } else {
            // HTTP Methods DO NOT match, and thus a change is required for target HTTP Method
            normalizedHeaders[headerKey] = config.httpMethod
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
      case (ENUM.Headers.GENERAL.ACCEPT.value):
        if (!config.hubNameRegex.test(config.sourceFsp)) {
          normalizedHeaders[headerKey] = headerValue
          break
        }
        if (!resourceType) resourceType = getResourceInfoFromHeader(headers[headerKey]).resourceType
        // Fall back to using the legacy approach to determine the resourceVersion
        if (resourceType && !acceptVersion) acceptVersion = resourceVersions[resourceType].acceptVersion
        normalizedHeaders[headerKey] = `application/vnd.interoperability.${resourceType}+json;version=${acceptVersion}`
        break
      case (ENUM.Headers.GENERAL.CONTENT_TYPE.value):
        if (!config.hubNameRegex.test(config.sourceFsp)) {
          normalizedHeaders[headerKey] = headerValue
          break
        }
        if (!resourceType) resourceType = getResourceInfoFromHeader(headers[headerKey]).resourceType
        // Fall back to using the legacy approach to determine the resourceVersion
        if (resourceType && !contentVersion) contentVersion = resourceVersions[resourceType].contentVersion
        normalizedHeaders[headerKey] = `application/vnd.interoperability.${resourceType}+json;version=${contentVersion}`
        break
      default:
        normalizedHeaders[headerKey] = headerValue
    }
  }

  if (normalizedHeaders[normalizedKeys[ENUM.Headers.FSPIOP.SOURCE]].match(config.hubNameRegex) !== null) {
    // Check to see if we find a regex match the source header containing the switch name.
    // If so we remove the signature added by default.
    delete normalizedHeaders[normalizedKeys[ENUM.Headers.FSPIOP.SIGNATURE]]
  }

  // Per the FSPIOP API spec, remove the Accept header on all PUT requests
  if (config && config.httpMethod === ENUM.RestMethods.PUT) {
    delete normalizedHeaders[ENUM.Headers.GENERAL.ACCEPT.value]
  }
  return normalizedHeaders
}

module.exports = {
  getResourceInfoFromHeader,
  transformHeaders
}
