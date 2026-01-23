'use strict'

// Motivation for this module is that hapi-openapi does not correctly validate headers on routes
// where the headers are specified at the path level, instead of the method level. And does not
// _appear_ to correctly validate the content of `string` + `pattern` headers at all, although the
// accuracy of this statement has not been thoroughly tested.

const { env } = require('node:process')
const { Factory: { createFSPIOPError }, Enums } = require('@mojaloop/central-services-error-handling')
const RootJoi = require('joi')
const DateExtension = require('@hapi/joi-date')
const { API_TYPES, MAX_CONTENT_LENGTH, CLIENT_ID_HEADER, errorMessages } = require('../../../constants')
const { Headers } = require('../../../enums/http')
const { logger } = require('../../../logger')
const {
  checkApiType,
  parseAcceptHeader,
  parseContentTypeHeader,
  protocolVersions,
  convertSupportedVersionToExtensionList
} = require('../../headerValidation')

const NEED_VALIDATION = (env.ENABLED_PROXY_SOURCE_HEADERS_VALIDATION ?? 'true') === 'true'

// Some defaults

const Joi = RootJoi.extend(DateExtension)
const dateSchema = Joi.date()
  .format('ddd, DD MMM YYYY HH:mm:ss [GMT]')
  .required()

const defaultProtocolResources = [
  'parties',
  'participants',
  'quotes',
  'transfers',
  'bulkTransfers',
  'bulkQuotes',
  'transactionRequests',
  'authorizations',
  'fxQuotes',
  'fxTransfers'
]

const defaultProtocolVersions = [
  ...protocolVersions.ONE,
  ...protocolVersions.TWO,
  protocolVersions.anyVersion
]

/**
 * HAPI plugin to validate request headers per FSPIOP-API spec 1.0
 *
 * @param {[Object]} supportedProtocolVersions - an array of numerical protocol version strings
 *                       supported by your implementation of the FSPIOP API e.g. ['1', '1.1']. Can
 *                       also contain the anyVersion symbol: ['1', '1.1', anyVersion] found
 *                       elsewhere in this module
 * @param {[string]} resources - the API resources you wish to be validated. See
 *                       defaultProtocolResources for an example.
 */

const plugin = {
  name: 'fspiop-api-protocol-version-header-validator',
  register: function (server, /* options: */ {
    resources = defaultProtocolResources,
    supportedProtocolContentVersions = defaultProtocolVersions,
    supportedProtocolAcceptVersions = defaultProtocolVersions,
    apiType = API_TYPES.fspiop,
    needProxySourceValidation = NEED_VALIDATION
  }) {
    checkApiType(apiType)

    server.ext('onPostAuth', (request, h) => {
      // First, extract the resource type from the path
      const resource = request.path.replace(/^\//, '').split('/')[0]

      // Only validate requests for the requested resources
      if (!resources.includes(resource)) {
        return h.continue
      }

      if (needProxySourceValidation) validateProxySourceHeaders(request.headers)

      // Always validate the accept header for a get request, or optionally if it has been
      // supplied
      if (request.method.toLowerCase() === 'get' || request.headers.accept) {
        if (request.headers.accept === undefined) {
          throw createFSPIOPError(Enums.FSPIOPErrorCodes.MISSING_ELEMENT, errorMessages.REQUIRE_ACCEPT_HEADER)
        }
        const accept = parseAcceptHeader(resource, request.headers.accept, apiType)
        if (!accept.valid) {
          throw createFSPIOPError(
            Enums.FSPIOPErrorCodes.MALFORMED_SYNTAX,
            errorMessages.INVALID_ACCEPT_HEADER
          )
        }
        if (!supportedProtocolAcceptVersions.some(supportedVer => accept.versions.has(supportedVer))) {
          const supportedVersionExtensionListMap = convertSupportedVersionToExtensionList(supportedProtocolAcceptVersions)
          throw createFSPIOPError(
            Enums.FSPIOPErrorCodes.UNACCEPTABLE_VERSION,
            errorMessages.REQUESTED_VERSION_NOT_SUPPORTED,
            null,
            null,
            supportedVersionExtensionListMap
          )
        }
      }

      const dateHeader = request.headers.date
      if (dateHeader === undefined) {
        throw createFSPIOPError(Enums.FSPIOPErrorCodes.MISSING_ELEMENT, 'Missing required date header')
      }
      const { error } = dateSchema.validate(dateHeader)
      if (error) {
        throw createFSPIOPError(Enums.FSPIOPErrorCodes.MALFORMED_SYNTAX, 'Invalid date header')
      }

      if (request.headers['content-length'] > MAX_CONTENT_LENGTH) {
        throw createFSPIOPError(Enums.FSPIOPErrorCodes.TOO_LARGE_PAYLOAD, 'Payload size is too large')
      }

      // Always validate the content-type header
      if (request.headers['content-type'] === undefined) {
        throw createFSPIOPError(Enums.FSPIOPErrorCodes.MISSING_ELEMENT, errorMessages.REQUIRE_CONTENT_TYPE_HEADER)
      }

      const contentType = parseContentTypeHeader(resource, request.headers['content-type'], apiType)
      if (!contentType.valid) {
        throw createFSPIOPError(
          Enums.FSPIOPErrorCodes.MALFORMED_SYNTAX,
          errorMessages.INVALID_CONTENT_TYPE_HEADER
        )
      }
      // if (!supportedProtocolContentVersions.includes(contentType.version)) {
      if (!supportedProtocolContentVersions.some(supportedVer => contentType.version === supportedVer)) {
        const supportedVersionExtensionListMap = convertSupportedVersionToExtensionList(supportedProtocolContentVersions)
        throw createFSPIOPError(
          Enums.FSPIOPErrorCodes.UNACCEPTABLE_VERSION,
          errorMessages.SUPPLIED_VERSION_NOT_SUPPORTED,
          null,
          null,
          supportedVersionExtensionListMap
        )
      }
      return h.continue
    })
  }
}

/* istanbul ignore next */
const validateProxySourceHeaders = (headers = {}) => {
  const proxy = headers[Headers.FSPIOP.PROXY]
  const source = headers[Headers.FSPIOP.SOURCE]
  const clientId = headers[CLIENT_ID_HEADER]
  // x-client-id is added by oathkeeper during processing request from DFSP to hub extapi

  if (!clientId) { // internal service-to-service calls
    logger.info('No x-client-id header found, skip source-header validation', { source })
    return
  }

  if (proxy && proxy !== clientId) {
    const errMessage = errorMessages.INVALID_PROXY_HEADER
    logger.error(errMessage, { clientId, proxy, source })
    throw createFSPIOPError(Enums.FSPIOPErrorCodes.VALIDATION_ERROR, errMessage)
  }

  if (!proxy && source !== clientId) {
    const errMessage = errorMessages.INVALID_SOURCE_HEADER
    logger.error(errMessage, { clientId, source })
    throw createFSPIOPError(Enums.FSPIOPErrorCodes.VALIDATION_ERROR, errMessage)
  }
}

module.exports = {
  plugin,
  defaultProtocolResources,
  defaultProtocolVersions
}
