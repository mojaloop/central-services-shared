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

const Uuid = require('uuid4')
const Enum = require('../../../enums')

/**
 * @function updateMessageProtocolMetadata
 *
 * @description Update the metadata  event object with a new type action and state
 *
 * @param {object} messageProtocol - The current messageProtocol from kafka
 * @param {string} metadataType - the type of flow. Example: 'notification'
 * @param {string} metadataAction - the action flow. Example: 'prepare'
 * @param {object} state - the state of the message being passed.
 *
 * @returns {object} - Returns updated messageProtocol
 */
const updateMessageProtocolMetadata = (messageProtocol, metadataType, metadataAction, state) => {
  if (!messageProtocol.metadata) {
    messageProtocol.metadata = {
      event: {
        id: Uuid(),
        type: metadataType,
        action: metadataAction,
        state: state
      }
    }
  } else {
    messageProtocol.metadata.event.responseTo = messageProtocol.metadata.event.id
    messageProtocol.metadata.event.id = Uuid()
    messageProtocol.metadata.event.type = metadataType
    messageProtocol.metadata.event.action = metadataAction
    messageProtocol.metadata.event.state = state
  }
  return messageProtocol
}

/**
 * @function createMessage
 *
 * @description Create a streaming message from the following parameters
 *
 * @param {string} id - the unique ID for the correlation of messages
 * @param {string} to - to whom the message is going
 * @param {string} from - from whom the message is received
 * @param {object} metadata - The metadata for streaming
 * @param {object} payload - The payload of the message
 * @param {object} headers - headers from the request
 * @param {object} uriParams - the URI parameters passed in request.
 * @param {string} type - the message type for the LIME message, defaults to 'application/json'
 *
 * @returns {object} - Returns generated messageProtocol
 */
const createMessage = (id, to, from, metadata, headers, payload, uriParams = undefined, type = undefined) => {
  return {
    id,
    to,
    from,
    type: type || Enum.Http.Headers.DEFAULT.APPLICATION_JSON,
    content: {
      uriParams: uriParams || undefined,
      headers: headers,
      payload: payload || {}
    },
    metadata
  }
}

/**
 * @function createMessageFromRequest
 *
 * @description Create a streaming message from the following request objects
 *
 * @param {string} id - the unique ID for the correlation of messages
 * @param {object} request - The current messageProtocol from kafka
 * @param {string} to - the action flow. Example: 'prepare'
 * @param {string} from - the state of the message being passed.
 * @param {object} metadata - The metadata for streaming
 *
 * @returns {object} - Returns generated messageProtocol
 */
const createMessageFromRequest = (id, request, to, from, metadata) => {
  return createMessage(id, to, from, metadata, request.headers, request.dataUri, request.params)
}

/**
 * @function createMetadata
 *
 * @description Create a metadata object for the streaming message
 *
 * @param {object} correlationId - The current messageProtocol from kafka
 * @param {object} eventMetadata - The event metadata for the streaming message
 *
 * @returns {object} - Returns generated metadata
 */
const createMetadata = (correlationId, eventMetadata) => {
  return {
    correlationId,
    event: eventMetadata
  }
}

/**
 * @function createMetadataWithCorrelatedEvent
 *
 * @description Create a metadata object from separate correlationId and action, type and state objects
 *
 * @param {object} correlationId - The current messageProtocol from kafka
 * @param {string} type - the type of message being sent Example: 'fulfil'
 * @param {string} action - the action of message being sent Example: 'commit'
 * @param {object} state - The state object for metadata usually contains information of status
 *
 * @returns {object} - Returns generated metadata
 */
const createMetadataWithCorrelatedEvent = (correlationId, type, action, state) => {
  const event = createEventMetadata(type, action, state)
  return createMetadata(correlationId, event)
}

/**
 * @function createMetadataWithCorrelatedEventState
 *
 * @description Create a metadata object from separate correlationId and action, type, status, code and description objects
 *
 * @param {object} correlationId - The current messageProtocol from kafka
 * @param {string} type - the type of message being sent Example: 'fulfil'
 * @param {string} action - the action of message being sent Example: 'commit'
 * @param {string} status - status of message
 * @param {number} code - error code
 * @param {string} description - description of error
 *
 * @returns {object} - Returns generated metadata
 */
const createMetadataWithCorrelatedEventState = (correlationId, type, action, status, code, description) => {
  const state = createEventState(status, code, description)
  const event = createEventMetadata(type, action, state)
  return createMetadata(correlationId, event)
}

/**
 * @function createEventMetadata
 *
 * @description Create an event metadata object for the streaming message
 *
 * @param {string} type - the type of message being sent Example: 'fulfil'
 * @param {string} action - the action of message being sent Example: 'commit'
 * @param {object} state - The state object for metadata usually contains information of status
 *
 * @returns {object} - Returns generated metadata
 */
const createEventMetadata = (type, action, state) => {
  return {
    type,
    action,
    createdAt: new Date(),
    state
  }
}

/**
 * @function createEventState
 *
 * @description Create the state of the event for failure or success
 *
 * @param {string} status - status of message
 * @param {number} code - error code
 * @param {string} description - description of error
 *
 * @returns {object} - Returns errorInformation object
 */
const createEventState = (status, code, description) => {
  return {
    status,
    code,
    description
  }
}

module.exports = {
  createMessage,
  createMessageFromRequest,
  updateMessageProtocolMetadata,
  createMetadata,
  createMetadataWithCorrelatedEvent,
  createMetadataWithCorrelatedEventState,
  createEventMetadata,
  createEventState
}
