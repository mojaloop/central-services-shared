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

 * ModusBox
 - Georgi Georgiev <georgi.georgiev@modusbox.com>
 - Miguel de Barros <miguel.debarros@modusbox.com>
 - Rajiv Mothilal <rajiv.mothilal@modusbox.com>
 - Shashikant Hirugade <shashikant.hirugade@modusbox.com>
 --------------
 ******/
'use strict'

const src = '../../../../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Uuid = require('uuid4')
const StreamingProtocol = require(`${src}/util`).StreamingProtocol
const Enum = require(`${src}`).Enum
const Helper = require('../../../../util/helper')
const base64url = require('base64url')

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

const purePayload = '{"errorInformation":{"errorCode":"5200","errorDescription":"Generic limit error, amount \u0026 payments threshold."}}'
const rawPayload = Buffer.from(purePayload)

const plainTextDataUri = 'data:text/plain;base64,eyJlcnJvckluZm9ybWF0aW9uIjp7ImVycm9yQ29kZSI6IjUyMDAiLCJlcnJvckRlc2NyaXB0aW9uIjoiR2VuZXJpYyBsaW1pdCBlcnJvciwgYW1vdW50ICYgcGF5bWVudHMgdGhyZXNob2xkLiJ9fQ=='
const plainTextDataUriErrorMimeType = 'data:tet/plain;base64,eyJlcnJvckluZm9ybWF0aW9uIjp7ImVycm9yQ29kZSI6IjUyMDAiLCJlcnJvckRlc2NyaXB0aW9uIjoiR2VuZXJpYyBsaW1pdCBlcnJvciwgYW1vdW50ICYgcGF5bWVudHMgdGhyZXNob2xkLiJ9fQ=='

const encodedMessage = {
  value: {
    id: 'f2f038cc-b749-464d-a364-c24acad58ef0',
    to: 'mockfsp02',
    from: 'mockfsp01',
    type: 'application/json',
    content: {
      headers: {
        accept: 'application/vnd.interoperability.transfers+json;version=1',
        'content-type': 'application/vnd.interoperability.transfers+json;version=1',
        date: '2019-01-22T21:27:55.000Z',
        'fspiop-source': 'mockfsp01',
        'fspiop-destination': 'mockfsp02',
        'content-length': 437
      },
      payload: 'data:application/json;base64,eyJlcnJvckluZm9ybWF0aW9uIjp7ImVycm9yQ29kZSI6IjUyMDAiLCJlcnJvckRlc2NyaXB0aW9uIjoiR2VuZXJpYyBsaW1pdCBlcnJvciwgYW1vdW50ICYgcGF5bWVudHMgdGhyZXNob2xkLiJ9fQ=='
    },
    metadata: {
      event: {
        id: '25240fa4-da6a-4f18-8b42-e391fde70817',
        type: 'prepare',
        action: 'prepare',
        createdAt: '2019-05-06T08:53:16.996Z',
        state: {
          status: 'success',
          code: 0
        }
      }
    }
  }
}

const decodedMessage = {
  value: {
    id: 'f2f038cc-b749-464d-a364-c24acad58ef0',
    to: 'mockfsp02',
    from: 'mockfsp01',
    type: 'application/json',
    content: {
      headers: {
        accept: 'application/vnd.interoperability.transfers+json;version=1',
        'content-type': 'application/vnd.interoperability.transfers+json;version=1',
        date: '2019-01-22T21:27:55.000Z',
        'fspiop-source': 'mockfsp01',
        'fspiop-destination': 'mockfsp02',
        'content-length': 437
      },
      payload: JSON.parse(purePayload)
    },
    metadata: {
      event: {
        id: '25240fa4-da6a-4f18-8b42-e391fde70817',
        type: 'prepare',
        action: 'prepare',
        createdAt: '2019-05-06T08:53:16.996Z',
        state: {
          status: 'success',
          code: 0
        }
      }
    }
  }
}

const messages = [encodedMessage]

Test('Utility Test', utilityTest => {
  let sandbox

  utilityTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    t.end()
  })

  utilityTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

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

    createMessageFromRequestTest.test('adds context object to message', (test) => {
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
      const isoContext = { iso20022: { key: 'value' } }
      const message = StreamingProtocol.createMessageFromRequest(
        correlationId,
        request,
        to,
        from,
        metadata,
        {
          iso20022: { key: 'value' }
        })
      test.deepEqual(message.context, isoContext)
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

    createMessageTest.test('add context object to message', (test) => {
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
      const isoContext = { iso20022: { key: 'value' } }
      const message = StreamingProtocol.createMessage(correlationId, to, from, metadata, headers, null, undefined, undefined, isoContext)
      test.deepEqual(message.context, isoContext)
      test.end()
    })

    createMessageTest.end()
  })

  utilityTest.test('Protocol::encodePayload should encode raw data as json', function (assert) {
    const test = StreamingProtocol.encodePayload(rawPayload, 'application/json')
    assert.deepEqual(test, encodedMessage.value.content.payload)
    assert.end()
  })

  utilityTest.test('Protocol::encodePayload should encode string', function (assert) {
    const test = StreamingProtocol.encodePayload(purePayload, 'text/plain')
    assert.equal(test, plainTextDataUri)
    assert.end()
  })

  utilityTest.test('Protocol::encodePayload should throw error if mime type is not correct', function (assert) {
    try {
      StreamingProtocol.encodePayload(purePayload, 'tex/plain')
      assert.fail('should throw error')
      assert.end()
    } catch (e) {
      assert.ok(e instanceof Error)
      assert.end()
    }
  })

  utilityTest.test('Protocol::decodePayload should decode the payload from base64 encoded JSON as dataURI to JSON', function (assert) {
    const test = StreamingProtocol.decodePayload(encodedMessage.value.content.payload)
    assert.deepEqual(test, JSON.parse(purePayload))
    assert.end()
  })

  utilityTest.test('Protocol::decodePayload should decode the payload from base64 encoded JSON to object with pure data and mimeType properties', function (assert) {
    const test = StreamingProtocol.decodePayload(encodedMessage.value.content.payload, { asParsed: false })
    const expectedResults = { mimeType: 'application/json', body: Buffer.from(purePayload) }
    assert.equal(test.mimeType.toString(), expectedResults.mimeType.toString())
    assert.equal(test.body.toString(), expectedResults.body.toString())
    assert.end()
  })

  utilityTest.test('Protocol::decodePayload should decode the payload from base64 encoded plain text as dataURI to JSON', function (assert) {
    const test = StreamingProtocol.decodePayload(plainTextDataUri)
    assert.deepEqual(JSON.stringify(test), JSON.stringify(purePayload))
    assert.end()
  })

  utilityTest.test('Protocol::decodePayload should decode the payload from normal string to JSON', function (assert) {
    const test = StreamingProtocol.decodePayload(purePayload)
    assert.deepEqual(test, JSON.parse(purePayload))
    assert.end()
  })

  utilityTest.test('Protocol::decodePayload should throw if mime type is not allowed', function (assert) {
    try {
      StreamingProtocol.decodePayload(plainTextDataUriErrorMimeType)
      assert.fail('should have thrown error')
      assert.end()
    } catch (e) {
      assert.ok(e instanceof Error)
      assert.end()
    }
  })

  utilityTest.test('Protocol::decodePayload should throw if input is not dataURI nor string', function (assert) {
    try {
      StreamingProtocol.decodePayload(3)
      assert.fail('should have thrown error')
      assert.end()
    } catch (e) {
      assert.ok(e instanceof Error)
      assert.end()
    }
  })

  utilityTest.test('Protocol::decodePayload should decode the payload from normal string to object with mimeType and the string itself ', function (assert) {
    const test = StreamingProtocol.decodePayload(purePayload, { asParsed: false })
    assert.deepEqual(JSON.stringify(test), JSON.stringify({ mimeType: 'text/plain', body: purePayload }))
    assert.end()
  })

  utilityTest.test('Protocol::decodeMessages should decode message as single message ', function (assert) {
    const test = StreamingProtocol.decodeMessages(JSON.parse(JSON.stringify(encodedMessage)))
    assert.deepEqual(test, decodedMessage)
    assert.end()
  })

  utilityTest.test('Protocol::decodeMessages should decode message as single message ', function (assert) {
    const test = StreamingProtocol.decodeMessages(messages)
    assert.deepEqual(test, [decodedMessage])
    assert.end()
  })

  utilityTest.test('Protocol::decodePayload should correctly handle a base64 encoded payload', function (assert) {
    const rawPayoad = '{"party":{"partyIdInfo":{"partyIdType":"MSISDN","partyIdentifier":"2224448888","fspId":"payeefsp"},"personalInfo":{"complexName":{"firstName":"ကောင်းထက်စံ","middleName":"အောင်","lastName":"ဒေါ်သန္တာထွန်"},"dateOfBirth":"1990-01-01"},"name":"ကောင်းထက်စံ အောင် ဒေါ်သန္တာထွန်"}}'
    const mimeType = 'application/vnd.interoperability.parties+json;version=1.0'
    const encodedPayload = StreamingProtocol.encodePayload(rawPayoad, mimeType)
    assert.deepEqual(StreamingProtocol.isDataUri(encodedPayload), true)
    const result = StreamingProtocol.decodePayload(encodedPayload, { asParsed: false })
    assert.deepEqual(rawPayoad, result.body)

    assert.end()
  })

  utilityTest.test('Protocol::decodePayload should correctly handle a base64URI encoded payload to ensure backward compatbilility', function (assert) {
    const encodedDataUriWithBase64URL = 'data:application/vnd.interoperability.parties+json;version=1.0;base64,eyJwYXJ0eSI6eyJwYXJ0eUlkSW5mbyI6eyJwYXJ0eUlkVHlwZSI6Ik1TSVNETiIsInBhcnR5SWRlbnRpZmllciI6IjIyMjQ0NDg4ODgiLCJmc3BJZCI6InBheWVlZnNwIn0sInBlcnNvbmFsSW5mbyI6eyJjb21wbGV4TmFtZSI6eyJmaXJzdE5hbWUiOiLhgIDhgLHhgKzhgIThgLrhgLjhgJHhgIDhgLrhgIXhgLYiLCJtaWRkbGVOYW1lIjoi4YCh4YCx4YCs4YCE4YC6IiwibGFzdE5hbWUiOiLhgJLhgLHhgKvhgLrhgJ7hgJThgLnhgJDhgKzhgJHhgL3hgJThgLoifSwiZGF0ZU9mQmlydGgiOiIxOTkwLTAxLTAxIn0sIm5hbWUiOiLhgIDhgLHhgKzhgIThgLrhgLjhgJHhgIDhgLrhgIXhgLYg4YCh4YCx4YCs4YCE4YC6IOGAkuGAseGAq-GAuuGAnuGAlOGAueGAkOGArOGAkeGAveGAlOGAuiJ9fQ'
    const result = StreamingProtocol.decodePayload(encodedDataUriWithBase64URL, { asParsed: false })
    assert.equal(encodedDataUriWithBase64URL.includes(base64url(result.body)), true)

    assert.end()
  })

  utilityTest.test('Protocol::decodePayload should correctly handle none-base64 encoded dataURIs', function (assert) {
    const jsonMessage = { hello: 'world' }
    const mimeType = 'application/vnd.interoperability.parties+json'
    const paramList = [
      'version=1.0'
    ]
    const params = paramList.reduce((prevParam, newParam) => {
      return `${prevParam};${newParam}`
    })
    const base64URLEncodedInput = `data:${mimeType};${params}, ${JSON.stringify(jsonMessage)}`
    const result = StreamingProtocol.decodePayload(base64URLEncodedInput, { asParsed: false })
    assert.deepEqual(mimeType, result.mimeType)
    assert.deepEqual(paramList, result.parameters)
    assert.deepEqual(jsonMessage, JSON.parse(result.body))

    assert.end()
  })

  utilityTest.end()
})
