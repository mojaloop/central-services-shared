/*****
 * @file This registers all handlers for the central-ledger API
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

 * ModusBox
 - Valentin Genev <valentin.genev@modusbox.com> - original code
 - Rajiv Mothilal <rajiv.mothilal@modusbox.com>

 --------------
 ******/
'use strict'

const getRawBody = require('raw-body')
const encodePayload = require('../../streaming/protocol').encodePayload
const Logger = require('@mojaloop/central-services-logger')
const ErrorHandler = require('@mojaloop/central-services-error-handling')

const requestRawPayloadTransform = (request, payloadBuffer) => {
  try {
    return Object.assign(request, {
      payload: JSON.parse(payloadBuffer.toString()),
      dataUri: encodePayload(payloadBuffer, request.headers['content-type']),
      rawPayload: payloadBuffer
    })
  } catch (err) {
    Logger.isErrorEnabled && Logger.error(err)
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
  }
}

/**
 * HAPI plugin to encode raw payload as base64 dataURI
 * the server settings should have the following settings:
 * routes: {
 *  payload: {
 *    output: 'stream',
 *    parse: true
 *  }
 * }
 *
 * provides the option to validate the request and keeps the raw bytes in the same time
 *
 * decorates the request with additionally:
 *
 * @param {string} payload payload to string for validation purposes. Prior the handler is executed the payload is changed to dataURI value
 * @param {string} dataURI base64 encoded string
 * @param {buffer} rawPayload the raw payload
 */

module.exports.plugin = {
  name: 'rawPayloadToDataUri',
  register: (server) => {
    if (server.settings.routes.payload.output === 'stream' && server.settings.routes.payload.parse) {
      server.ext([{
        type: 'onPostAuth',
        method: async (request, h) => {
          if (request.payload) {
            return getRawBody(request.payload)
              .then(rawBuffer => {
                if (Buffer.byteLength(rawBuffer) !== 0) {
                  request = requestRawPayloadTransform(request, rawBuffer)
                }
                return h.continue
              }).catch(() => {
                return h.continue
              })
          }
          return h.continue
        }
      }])
    }
  }
}
