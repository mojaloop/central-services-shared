/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

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

 * Lazola Lucas <lazola.lucas@modusbox.com>
 * Rajiv Mothilal <rajiv.mothilal@modusbox.com>
 * Miguel de Barros <miguel.debarros@modusbox.com>

 --------------
 ******/

'use strict'

const Logger = require('../../logger')

const parseMessage = (messageProtocol) => {
  return {
    from: messageProtocol.from,
    to: messageProtocol.to,
    id: messageProtocol.id,
    content: messageProtocol.message,
    type: messageProtocol.type,
    metadata: messageProtocol.metadata,
    pp: messageProtocol.pp
  }
}

// const parseNotify = (from, to, key, message, metadata, event, reason, type, pp = '') => {
//   metadata.resource = message
//   return {
//     from: from,
//     to: to,
//     id: key,
//     type: type,
//     metadata: metadata,
//     pp,
//     event: event,
//     reason: {
//       code: reason.code,
//       description: reason.description
//     }
//   }
// }
//
// const parseCommand = (from, to, key, message, reason, method, metadata, status, type, pp = '') => {
//   return {
//     from: from,
//     to: to,
//     id: key,
//     resource: message,
//     type: type,
//     metadata: metadata,
//     pp,
//     method: method,
//     uri: '',
//     status: status,
//     reason: {
//       code: reason.code,
//       description: reason.description
//     }
//   }
// }

const parseValue = (value, charset = 'utf8', asJSON = true) => {
  Logger.silly('Protocol::parseMessage() - start')

  // if (typeof value === 'object') {
  //   return value
  // }

  var parsedValue = value.toString(charset)

  if (asJSON) {
    try {
      parsedValue = JSON.parse(parsedValue)
    } catch (error) {
      Logger.error(`Protocol::parseMessage() - error - unable to parse message as JSON -  ${error}`)
      Logger.silly('Protocol::parseMessage() - end')
      // throw new Error('unable to parse message as JSON')
    }
  }
  Logger.silly('Protocol::parseMessage() - end')
  return parsedValue
}

exports.parseValue = parseValue
exports.parseMessage = parseMessage
