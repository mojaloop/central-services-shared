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
  // let sandbox
  //
  // utilityTest.beforeEach(test => {
  //   sandbox = Sinon.createSandbox()
  //   sandbox.stub(KafkaProducer.prototype, 'constructor').returns(Promise.resolve())
  //   sandbox.stub(KafkaProducer.prototype, 'connect').returns(Promise.resolve())
  //   sandbox.stub(KafkaProducer.prototype, 'sendMessage').returns(Promise.resolve())
  //   sandbox.stub(KafkaProducer.prototype, 'disconnect').returns(Promise.resolve())
  //   participantName = 'testParticipant'
  //   test.end()
  // })
  //
  // utilityTest.afterEach(test => {
  //   sandbox.restore()
  //   test.end()
  // })

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

  utilityTest.test('createState should', createStateTest => {
    createStateTest.test('create a state', async (test) => {
      const state = {
        status: 'status',
        code: 1,
        description: 'description'
      }
      const result = await StreamingProtocol.createEventState(state.status, state.code, state.description)
      test.deepEqual(result, state)
      test.end()
    })

    createStateTest.end()
  })

  utilityTest.end()
})
