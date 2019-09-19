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

 * Georgi Georgiev <georgi.georgiev@modusbox.com>
 * Shashikant Hirugade <shashikant.hirugade@modusbox.com>
 * Rajiv Mothilal <rajiv.mothilal@modusbox.com>
 * Miguel de Barros <miguel.debarros@modusbox.com>

 --------------
 ******/
'use strict'

const src = '../../../../../src'
const Test = require('tapes')(require('tape'))
const Uuid = require('uuid4')
const StreamingProtocol = require(`${src}/util`).StreamingProtocol
const Enum = require(`${src}`).Enum
const Helper = require('../../../../util/helper')

const TRANSFER = Enum.Events.Event.Type.TRANSFER
const PREPARE = Enum.Events.Event.Action.PREPARE

const transfer = {
  transferId: 'b51ec534-ee48-4575-b6a9-ead2955b8999',
  payerFsp: 'dfsp1',
  payeeFsp: 'dfsp2',
  amount: {
    currency: 'USD',
    amount: '433.88'
  },
  ilpPacket: 'AYIBgQAAAAAAAASwNGxldmVsb25lLmRmc3AxLm1lci45T2RTOF81MDdqUUZERmZlakgyOVc4bXFmNEpLMHlGTFGCAUBQU0svMS4wCk5vbmNlOiB1SXlweUYzY3pYSXBFdzVVc05TYWh3CkVuY3J5cHRpb246IG5vbmUKUGF5bWVudC1JZDogMTMyMzZhM2ItOGZhOC00MTYzLTg0NDctNGMzZWQzZGE5OGE3CgpDb250ZW50LUxlbmd0aDogMTM1CkNvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvbgpTZW5kZXItSWRlbnRpZmllcjogOTI4MDYzOTEKCiJ7XCJmZWVcIjowLFwidHJhbnNmZXJDb2RlXCI6XCJpbnZvaWNlXCIsXCJkZWJpdE5hbWVcIjpcImFsaWNlIGNvb3BlclwiLFwiY3JlZGl0TmFtZVwiOlwibWVyIGNoYW50XCIsXCJkZWJpdElkZW50aWZpZXJcIjpcIjkyODA2MzkxXCJ9IgA',
  condition: 'YlK5TZyhflbXaDRPtR5zhCu8FrbgvrQwwmzuH0iQ0AI',
  expiration: '2016-05-24T08:38:08.699-04:00',
  extensionList: {
    extension: [
      {
        key: 'key1',
        value: 'value1'
      },
      {
        key: 'key2',
        value: 'value2'
      }
    ]
  }
}

const messageProtocol = {
  id: transfer.transferId,
  from: transfer.payerFsp,
  to: transfer.payeeFsp,
  type: 'application/json',
  content: {
    header: {},
    payload: transfer
  },
  metadata: {
    event: {
      id: Uuid(),
      type: 'prepare',
      action: 'commit',
      createdAt: new Date(),
      state: {
        status: 'success',
        code: 0,
        description: 'action successful'
      }
    }
  },
  pp: ''
}

Test('Utility Test', utilityTest => {
  utilityTest.test('updateMessageProtocolMetadata should', updateMessageProtocolMetadataTest => {
    updateMessageProtocolMetadataTest.test('return an updated metadata object in the message protocol', test => {
      const previousEventId = messageProtocol.metadata.event.id
      const newMessageProtocol = StreamingProtocol.updateMessageProtocolMetadata(messageProtocol, TRANSFER, PREPARE, Enum.Events.EventStatus.SUCCESS)
      test.equal(newMessageProtocol.metadata.event.state, Enum.Events.EventStatus.SUCCESS)
      test.equal(newMessageProtocol.metadata.event.type, TRANSFER)
      test.equal(newMessageProtocol.metadata.event.action, PREPARE)
      test.equal(newMessageProtocol.metadata.event.responseTo, previousEventId)
      test.end()
    })

    updateMessageProtocolMetadataTest.test('return an updated metadata object in the message protocol if metadata is not present', test => {
      const newMessageProtocol = StreamingProtocol.updateMessageProtocolMetadata({}, TRANSFER, PREPARE, Enum.Events.EventStatus.SUCCESS)
      test.equal(newMessageProtocol.metadata.event.state, Enum.Events.EventStatus.SUCCESS)
      test.equal(newMessageProtocol.metadata.event.type, TRANSFER)
      test.equal(newMessageProtocol.metadata.event.action, PREPARE)
      test.end()
    })

    updateMessageProtocolMetadataTest.end()
  })

  utilityTest.test('createEventState should', createEventStateTest => {
    createEventStateTest.test('create a state', (test) => {
      const state = {
        status: 'status',
        code: 1,
        description: 'description'
      }
      const result = StreamingProtocol.createEventState(state.status, state.code, state.description)
      test.deepEqual(result, state)
      test.end()
    })

    createEventStateTest.end()
  })

  utilityTest.test('createEventMetadata should', createEventMetadataTest => {
    createEventMetadataTest.test('create an event', (test) => {
      const state = {
        status: 'status',
        code: 1,
        description: 'description'
      }
      const event = {
        type: Enum.Events.Event.Type.FULFIL,
        action: Enum.Events.Event.Action.COMMIT,
        state
      }
      const result = StreamingProtocol.createEventMetadata(event.type, event.action, state)
      test.deepEqual(result.state, state)
      test.equal(result.action, event.action)
      test.equal(result.type, event.type)
      test.end()
    })

    createEventMetadataTest.end()
  })

  utilityTest.test('createMetadataWithCorrelatedEventState should', createMetadataWithCorrelatedEventStateTest => {
    createMetadataWithCorrelatedEventStateTest.test('create a metadata object', (test) => {
      const state = {
        status: 'status',
        code: 1,
        description: 'description'
      }
      const event = {
        type: Enum.Events.Event.Type.FULFIL,
        action: Enum.Events.Event.Action.COMMIT,
        state
      }
      const correlationId = 'c74b826d-3c0b-4cfd-8ec1-08cc4343fe8c'
      const metadata = StreamingProtocol.createMetadataWithCorrelatedEventState(correlationId, event.type, event.action, state.status, state.code, state.description)
      test.deepEqual(metadata.event.state, state)
      test.equal(metadata.event.action, event.action)
      test.equal(metadata.event.type, event.type)
      test.equal(metadata.correlationId, correlationId)
      test.end()
    })

    createMetadataWithCorrelatedEventStateTest.end()
  })

  utilityTest.test('createMetadataWithCorrelatedEventState should', createMetadataWithCorrelatedEventTest => {
    createMetadataWithCorrelatedEventTest.test('create a metadata object', (test) => {
      const state = {
        status: 'status',
        code: 1,
        description: 'description'
      }
      const event = {
        type: Enum.Events.Event.Type.FULFIL,
        action: Enum.Events.Event.Action.COMMIT,
        state
      }
      const correlationId = 'c74b826d-3c0b-4cfd-8ec1-08cc4343fe8c'
      const metadata = StreamingProtocol.createMetadataWithCorrelatedEvent(correlationId, event.type, event.action, state)
      test.deepEqual(metadata.event.state, state)
      test.equal(metadata.event.action, event.action)
      test.equal(metadata.event.type, event.type)
      test.equal(metadata.correlationId, correlationId)
      test.end()
    })

    createMetadataWithCorrelatedEventTest.end()
  })

  utilityTest.test('createMessageFromRequest should', createMessageFromRequestTest => {
    createMessageFromRequestTest.test('create a metadata object', (test) => {
      const state = {
        status: 'status',
        code: 1,
        description: 'description'
      }
      const event = {
        type: Enum.Events.Event.Type.FULFIL,
        action: Enum.Events.Event.Action.COMMIT,
        state
      }
      const dataUri = 'data:application/json;base64,eyJlcnJvckluZm9ybWF0aW9uIjp7ImVycm9yQ29kZSI6IjUyMDAiLCJlcnJvckRlc2NyaXB0aW9uIjoiR2VuZXJpYyBsaW1pdCBlcnJvciwgYW1vdW50ICYgcGF5bWVudHMgdGhyZXNob2xkLiJ9fQ'
      const correlationId = 'c74b826d-3c0b-4cfd-8ec1-08cc4343fe8c'
      const metadata = StreamingProtocol.createMetadataWithCorrelatedEvent(correlationId, event.type, event.action, state)
      const to = 'fsp1'
      const from = 'fsp2'
      const headers = Helper.defaultHeaders(to, 'participants', from)
      const request = {
        dataUri,
        headers
      }
      const message = StreamingProtocol.createMessageFromRequest(correlationId, request, to, from, metadata)
      test.deepEqual(message.metadata.event.state, state)
      test.equal(message.metadata.event.action, event.action)
      test.equal(message.metadata.event.type, event.type)
      test.equal(message.metadata.correlationId, correlationId)
      test.deepEqual(message.content.headers, headers)
      test.equal(message.to, to)
      test.equal(message.from, from)
      test.equal(message.id, correlationId)
      test.equal(message.content.payload, dataUri)
      test.end()
    })

    createMessageFromRequestTest.end()
  })

  utilityTest.test('createMessage should', createMessageTest => {
    createMessageTest.test('create a metadata object', (test) => {
      const state = {
        status: 'status',
        code: 1,
        description: 'description'
      }
      const event = {
        type: Enum.Events.Event.Type.FULFIL,
        action: Enum.Events.Event.Action.COMMIT,
        state
      }
      const correlationId = 'c74b826d-3c0b-4cfd-8ec1-08cc4343fe8c'
      const metadata = StreamingProtocol.createMetadataWithCorrelatedEvent(correlationId, event.type, event.action, state)
      const to = 'fsp1'
      const from = 'fsp2'
      const headers = Helper.defaultHeaders(to, 'participants', from)
      const message = StreamingProtocol.createMessage(correlationId, to, from, metadata, headers, null)
      test.deepEqual(message.metadata.event.state, state)
      test.equal(message.metadata.event.action, event.action)
      test.equal(message.metadata.event.type, event.type)
      test.equal(message.metadata.correlationId, correlationId)
      test.deepEqual(message.content.headers, headers)
      test.equal(message.to, to)
      test.equal(message.from, from)
      test.equal(message.id, correlationId)
      test.deepEqual(message.content.payload, {})
      test.end()
    })

    createMessageTest.end()
  })

  utilityTest.end()
})
