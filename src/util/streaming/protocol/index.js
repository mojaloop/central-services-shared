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
const clone = require('clone')

const allowedRegexForMimeTypes = /(text\/plain)|(application\/json)|(application\/vnd.interoperability[.])/

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
        state
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
      headers,
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

/**
 * Encodes Payload to base64 encoded data URI
 *
 * @param {buffer|string} input - Buffer or String
 * @param {MimeTypes} mimeType - mime type of the input
 *
 * @return {string} - Returns base64 encoded data  URI string
 */

const encodePayload = (input, mimeType) => {
  if (allowedRegexForMimeTypes.test(mimeType)) {
    return (input instanceof Buffer)
      ? `data:${mimeType};base64,${input.toString('base64')}`
      : `data:${mimeType};base64,${Buffer.from(input).toString('base64')}`
  } else {
    throw new Error(`mime type should match the following regex:${allowedRegexForMimeTypes.toString()}`)
  }
}

const DataUriRegEx = /^data:((?:\w+\/(?:(?!;).)+)?)((?:;[\w\W]*?[^;])*),(.+)$/

/**
 *
 * @param {string} input - Data URI or plain string
 * @returns {boolean} - Whether or not the input is a data uri per regex
 */
const isDataUri = (input) => {
  return DataUriRegEx.test(input)
}

/**
 * Parse dataUri into its components consisting of: data:[<mimeType>][;<parameters>][;base64],<body>
 *  - mimeType: The mime type
 *  - body: un-parsed body (i.e. a string will be returned), but will be base64 decoded if `base64` extension is found in the dataUri
 *  - parameters: parameter list
 *
 * @param {string} dataUri - Data URI string
 *
 * @return {(object\|Protocol~DecodedURI)} returns an decodedURI containing the mimeType, body (base64 decoded if necessary), and parameter list
 */
const parseDataURI = (dataUri) => {
  const matches = DataUriRegEx.exec(dataUri)
  let isBase64 = false
  let parameters = []
  let body = (matches[3] && matches[3].length > 0) ? matches[3] : ''
  if (matches[2] && matches[2].length > 0) {
    parameters = matches[2].split(';').filter(param => param.length > 0)
    isBase64 = (parameters.length > 0 && parameters[parameters.length - 1] === 'base64')
  }

  if (isBase64) {
    body = Buffer.from(body, 'base64').toString()
  }

  return {
    mimeType: matches[1],
    body,
    parameters
  }
}

/**
 * Decode Payload to base64 encoded data URI
 *
 * @param {string} input - Data URI or plain string
 * @param {object} [options = {asParsed: true}] - Parising object
 *
 * @return {(object\|Protocol~DecodedURI)} based on the options, returns parsed JSON or decodedURI object
 */
const decodePayload = (input, { asParsed = true } = {}) => {
  const parseDecodedDataToJson = (decodedData) => {
    const isAllowedMimeTypes = allowedRegexForMimeTypes.test(decodedData.mimeType.toString())
    if (isAllowedMimeTypes && decodedData.mimeType.toString() !== 'text/plain') return JSON.parse(decodedData.body.toString())
    else if (isAllowedMimeTypes && decodedData.mimeType.toString() === 'text/plain') return decodedData.body.toString()
    else throw new Error('invalid mime type')
  }
  if (isDataUri(input)) {
    const parsedDataUrl = parseDataURI(input)
    return asParsed
      ? parseDecodedDataToJson(parsedDataUrl)
      : parsedDataUrl
  } else if (typeof input === 'string') {
    return asParsed ? JSON.parse(input) : { mimeType: 'text/plain', body: input }
  } else if (typeof input === 'object') {
    return asParsed ? input : { mimeType: 'application/json', body: JSON.stringify(input) }
  } else {
    throw new Error('input should be Buffer or String')
  }
}

/**
 * Decode message or messages
 *
 * @param {(Protocol~Message\|Protocol~Message[])} messages - single message or array of messages with payload encoded as base64 dataURI
 * @param {object} [options = {asParsed: true}] - options to parse the payload or not
 *
 * @returns {(Protocol~Message\|Protocol~Message[])} - messages with decoded payload
 */

const decodeMessages = (messages) => {
  const decodeMessage = (message) => {
    const decodedMessage = clone(message)
    decodedMessage.value.content.payload = decodePayload(decodedMessage.value.content.payload)
    return decodedMessage
  }

  if (Array.isArray(messages)) {
    const result = []
    for (const message of messages) {
      const decodedMessage = decodeMessage(message)
      result.push(decodedMessage)
    }
    return result
  } else {
    return decodeMessage(messages)
  }
}

module.exports = {
  decodePayload,
  encodePayload,
  decodeMessages,
  isDataUri,
  createMessage,
  createMessageFromRequest,
  updateMessageProtocolMetadata,
  createMetadata,
  createMetadataWithCorrelatedEvent,
  createMetadataWithCorrelatedEventState,
  createEventMetadata,
  createEventState,
  parseDataURI
}
