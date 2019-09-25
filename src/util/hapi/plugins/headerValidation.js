'use strict'

// Motivation for this module is that hapi-openapi does not correctly validate headers on routes
// where the headers are specified at the path level, instead of the method level. And does not
// _appear_ to correctly validate the content of `string` + `pattern` headers at all, although the
// accuracy of this statement has not been thoroughly tested.

const { Factory: { createFSPIOPError }, Enums } = require('@mojaloop/central-services-error-handling')
const { parseAcceptHeader, parseContentTypeHeader, protocolVersions } = require('../../headerValidation')

// Some defaults

const defaultProtocolResources = [
  'parties',
  'participants',
  'quotes',
  'transfers'
]

const defaultProtocolVersions = [
  ...protocolVersions.ONE,
  protocolVersions.anyVersion
]

const errorMessages = {
  REQUESTED_VERSION_NOT_SUPPORTED: 'Client requested to use a protocol version which is not supported by the server',
  INVALID_ACCEPT_HEADER: 'Invalid accept header',
  INVALID_CONTENT_TYPE_HEADER: 'Invalid content-type header',
  SUPPLIED_VERSION_NOT_SUPPORTED: 'Client supplied a protocol version which is not supported by the server'
}

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
    supportedProtocolVersions = defaultProtocolVersions
  }) {
    server.ext('onPreHandler', (request, h) => {
      // First, extract the resource type from the path
      const resource = request.path.replace(/^\//, '').split('/')[0]

      // Only validate requests for the requested resources
      if (!resources.includes(resource)) {
        return h.continue
      }

      // Always validate the accept header for a get request, or optionally if it has been
      // supplied
      if (request.method.toLowerCase() === 'get' || request.headers.accept) {
        const accept = parseAcceptHeader(resource, request.headers.accept)
        if (!accept.valid) {
          throw createFSPIOPError(
            Enums.FSPIOPErrorCodes.MALFORMED_SYNTAX,
            errorMessages.INVALID_ACCEPT_HEADER
          )
        }
        if (!supportedProtocolVersions.some(supportedVer => accept.versions.has(supportedVer))) {
          throw createFSPIOPError(
            Enums.FSPIOPErrorCodes.UNACCEPTABLE_VERSION,
            errorMessages.REQUESTED_VERSION_NOT_SUPPORTED
          )
        }
      }

      // Always validate the content-type header
      const contentType = parseContentTypeHeader(resource, request.headers['content-type'])
      if (!contentType.valid) {
        throw createFSPIOPError(
          Enums.FSPIOPErrorCodes.MALFORMED_SYNTAX,
          errorMessages.INVALID_CONTENT_TYPE_HEADER
        )
      }
      if (!supportedProtocolVersions.includes(contentType.version)) {
        throw createFSPIOPError(
          Enums.FSPIOPErrorCodes.UNACCEPTABLE_VERSION,
          errorMessages.SUPPLIED_VERSION_NOT_SUPPORTED
        )
      }

      return h.continue
    })
  }
}

module.exports = {
  plugin,
  errorMessages,
  defaultProtocolVersions
}
