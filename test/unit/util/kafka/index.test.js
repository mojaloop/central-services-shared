/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>

 * Georgi Georgiev <georgi.georgiev@modusbox.com>
 * Shashikant Hirugade <shashikant.hirugade@modusbox.com>
 * Rajiv Mothilal <rajiv.mothilal@modusbox.com>
 * Miguel de Barros <miguel.debarros@modusbox.com>

 --------------
 ******/

'use strict'

const src = '../../../../src'
const rewire = require('rewire')
const Sinon = require('sinon')
const Test = require('tapes')(require('tape'))
const Mustache = require('mustache')
const Uuid = require('uuid4')
const ErrorHandler = require('@mojaloop/central-services-error-handling')
const EventSdk = require('@mojaloop/event-sdk')
const Proxyquire = require('proxyquire')
const MainUtil = require('../../../../src/util')
const Utility = require('../../../../src/util').Kafka
const Enum = require('../../../../src').Enum
const Config = require('../../../util/config')
const clone = require('../../../../src/util').clone
const { _getFunctionalityAction } = require('../../../../src/util/kafka')

let participantName
const TRANSFER = Enum.Events.Event.Type.TRANSFER
const PREPARE = Enum.Events.Event.Action.PREPARE
const FULFIL = Enum.Events.Event.Action.FULFIL
const CONSUMER = Enum.Kafka.Config.CONSUMER

const participantTopic = 'topic-testParticipant-transfer-prepare'
const generalTopic = 'topic-transfer-fulfil'

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
let KafkaProducer

Test('Utility Test', utilityTest => {
  let sandbox

  utilityTest.beforeEach(test => {
    sandbox = Sinon.createSandbox()
    participantName = 'testParticipant'
    KafkaProducer = {
      produceMessage: sandbox.stub()
    }
    test.end()
  })

  utilityTest.afterEach(test => {
    sandbox.restore()
    test.end()
  })

  utilityTest.test('getFunctionalityAction', gfaTest => {
    gfaTest.test('should return config for transfer-prepare', test => {
      // Arrange
      const expected = { functionalityMapped: 'transfer', actionMapped: 'prepare' }
      // Act
      const result = _getFunctionalityAction('transfer', 'prepare')

      // Assert
      test.deepEqual(result, expected)
      test.end()
    })

    gfaTest.test('should return config for NOTIFICATION ABORT_VALIDATION', test => {
      // Arrange
      const expected = { functionalityMapped: 'notification', actionMapped: 'event' }
      // Act
      const result = _getFunctionalityAction('notification', 'abort-validation')

      // Assert
      test.deepEqual(result, expected)
      test.end()
    })

    gfaTest.test('should return config for transfer-reserved-aborted', test => {
      // Arrange
      const expected = { functionalityMapped: 'notification', actionMapped: 'event' }
      // Act
      const result = _getFunctionalityAction('notification', 'reserved-aborted')

      // Assert
      test.deepEqual(result, expected)
      test.end()
    })

    gfaTest.end()
  })

  utilityTest.test('createParticipantTopicConf should', createParticipantTopicConfTest => {
    createParticipantTopicConfTest.test('return a participant topic conf object', test => {
      const response = Utility.createParticipantTopicConf(Config.KAFKA_CONFIG.TOPIC_TEMPLATES.PARTICIPANT_TOPIC_TEMPLATE.TEMPLATE, participantName, TRANSFER, PREPARE, 0)
      test.equal(response.topicName, participantTopic)
      test.equal(response.key, 0)
      test.equal(response.partition, null)
      test.equal(response.opaqueKey, null)
      test.end()
    })

    createParticipantTopicConfTest.test('throw error when Mustache cannot find config', test => {
      try {
        Sinon.stub(Mustache, 'render').throws(new Error())
        Utility.createParticipantTopicConf(Config.KAFKA_CONFIG.TOPIC_TEMPLATES.PARTICIPANT_TOPIC_TEMPLATE.TEMPLATE, participantName, TRANSFER, PREPARE)
        test.fail('No Error thrown')
        test.end()
        Mustache.render.restore()
      } catch (e) {
        test.pass('Error thrown')
        test.end()
        Mustache.render.restore()
      }
    })

    createParticipantTopicConfTest.end()
  })

  utilityTest.test('createGeneralTopicConf should', createGeneralTopicConfTest => {
    createGeneralTopicConfTest.test('return a general topic conf object', test => {
      const response = Utility.createGeneralTopicConf(Config.KAFKA_CONFIG.TOPIC_TEMPLATES.GENERAL_TOPIC_TEMPLATE.TEMPLATE, TRANSFER, FULFIL, 0)
      test.equal(response.topicName, generalTopic)
      test.equal(response.key, 0)
      test.equal(response.partition, null)
      test.equal(response.opaqueKey, null)
      test.end()
    })

    createGeneralTopicConfTest.test('return a general topic conf object using topicMap', test => {
      const ModuleProxy = Proxyquire('../../../../src/util/kafka', {
        '../../enums': {
          topicMap: {
            transfer: {
              fulfil: {
                functionality: 'transfer',
                action: 'fulfil'
              }
            }
          }
        }
      })
      const response = ModuleProxy.createGeneralTopicConf(Config.KAFKA_CONFIG.TOPIC_TEMPLATES.GENERAL_TOPIC_TEMPLATE.TEMPLATE, TRANSFER, FULFIL, 0)
      test.equal(response.topicName, generalTopic)
      test.equal(response.key, 0)
      test.equal(response.partition, null)
      test.equal(response.opaqueKey, null)
      test.end()
    })

    createGeneralTopicConfTest.test('throw error when Mustache cannot find config', test => {
      try {
        Sinon.stub(Mustache, 'render').throws(new Error())
        Utility.createGeneralTopicConf(Config.KAFKA_CONFIG.TOPIC_TEMPLATES.GENERAL_TOPIC_TEMPLATE.TEMPLATE, TRANSFER, FULFIL)
        test.fail('No Error thrown')
        test.end()
        Mustache.render.restore()
      } catch (e) {
        test.pass('Error thrown')
        test.end()
        Mustache.render.restore()
      }
    })

    createGeneralTopicConfTest.test('return topic name override when specfied', test => {
      const ModuleProxy = Proxyquire('../../../../src/util/kafka', {
        '../../enums': {
          topicMap: {
            transfer: {
              fulfil: {
                functionality: 'transfer',
                action: 'fulfil'
              }
            }
          }
        }
      })
      const response = ModuleProxy.createGeneralTopicConf(Config.KAFKA_CONFIG.TOPIC_TEMPLATES.GENERAL_TOPIC_TEMPLATE.TEMPLATE, TRANSFER, FULFIL, 0, null, null, 'topic-name-override')
      test.equal(response.topicName, 'topic-name-override')
      test.equal(response.key, 0)
      test.equal(response.partition, null)
      test.equal(response.opaqueKey, null)
      test.end()
    })

    createGeneralTopicConfTest.end()
  })

  utilityTest.test('getKafkaConfig should', getKafkaConfigTest => {
    getKafkaConfigTest.test('return the Kafka config from the default.json', test => {
      const config = Utility.getKafkaConfig(Config.KAFKA_CONFIG, CONSUMER, TRANSFER.toUpperCase(), PREPARE.toUpperCase())
      test.ok(config.rdkafkaConf !== undefined)
      test.ok(config.options !== undefined)
      test.end()
    })

    getKafkaConfigTest.test('throw and error if Kafka config not in default.json', test => {
      try {
        Utility.getKafkaConfig(Config.KAFKA_CONFIG, CONSUMER, TRANSFER, PREPARE)
        test.fail('Error not thrown')
        test.end()
      } catch (e) {
        test.pass('Error thrown')
        test.end()
      }
    })

    getKafkaConfigTest.end()
  })

  utilityTest.test('transformGeneralTopicName should', getKafkaConfigTest => {
    getKafkaConfigTest.test('return the general topic name using a template in the default.json', test => {
      const topicName = Utility.transformGeneralTopicName(Config.KAFKA_CONFIG.TOPIC_TEMPLATES.GENERAL_TOPIC_TEMPLATE.TEMPLATE, Enum.Events.Event.Type.NOTIFICATION, Enum.Events.Event.Action.ABORT)
      test.ok(topicName === 'topic-notification-event')
      test.end()
    })
    getKafkaConfigTest.end()
  })

  utilityTest.test('produceGeneralMessage should', produceGeneralMessageTest => {
    produceGeneralMessageTest.test('produce a general message', async (test) => {
      const span = EventSdk.Tracer.createSpan('test_span')
      const result = await Utility.produceGeneralMessage(Config.KAFKA_CONFIG, KafkaProducer, TRANSFER, PREPARE, messageProtocol, Enum.Events.EventStatus.SUCCESS, undefined, span)
      test.equal(result, true)
      test.end()
    })

    produceGeneralMessageTest.test('produce a general message using topicMap', async (test) => {
      const ModuleProxy = Proxyquire('../../../../src/util/kafka', {
        '../../enums': {
          topicMap: {
            transfer: {
              prepare: {
                functionality: 'transfer',
                action: 'prepare'
              }
            }
          }
        }
      })
      const result = await ModuleProxy.produceGeneralMessage(Config.KAFKA_CONFIG, KafkaProducer, TRANSFER, PREPARE, messageProtocol, Enum.Events.EventStatus.SUCCESS)
      test.equal(result, true)
      test.end()
    })

    produceGeneralMessageTest.test('produce a message with topic name override when specified', async (test) => {
      const ModuleProxy = Proxyquire('../../../../src/util/kafka', {
        '../../enums': {
          topicMap: {
            transfer: {
              prepare: {
                functionality: 'transfer',
                action: 'prepare'
              }
            }
          }
        }
      })
      const result = await ModuleProxy.produceGeneralMessage(Config.KAFKA_CONFIG, KafkaProducer, TRANSFER, PREPARE, messageProtocol, Enum.Events.EventStatus.SUCCESS, null, null, 'topic-name-override')
      test.equal(KafkaProducer.produceMessage.getCall(0).args[1].topicName, 'topic-name-override')
      test.equal(result, true)
      test.end()
    })

    produceGeneralMessageTest.test('produce a notification message using topicMap', async (test) => {
      const ModuleProxy = Proxyquire('../../../../src/util/kafka', {
        '../../enums': {
          topicMap: {
            transfer: {
              prepare: {
                functionality: 'transfer',
                action: 'prepare'
              }
            }
          }
        }
      })
      const result = await ModuleProxy.produceGeneralMessage(Config.KAFKA_CONFIG, KafkaProducer, Enum.Events.Event.Type.NOTIFICATION, Enum.Events.Event.Action.ABORT, messageProtocol, Enum.Events.EventStatus.SUCCESS)
      test.equal(result, true)
      test.end()
    })

    produceGeneralMessageTest.test('produce a general message', async (test) => {
      try {
        await Utility.produceGeneralMessage(Config.KAFKA_CONFIG, KafkaProducer, TRANSFER, 'invalid', messageProtocol, Enum.Events.EventStatus.SUCCESS)
      } catch (e) {
        test.ok(e instanceof Error)
      }
      test.end()
    })

    produceGeneralMessageTest.end()
  })

  utilityTest.test('produceParticipantMessage should', produceParticipantMessageTest => {
    produceParticipantMessageTest.test('produce a participant message', async (test) => {
      const result = await Utility.produceParticipantMessage(Config.KAFKA_CONFIG, KafkaProducer, participantName, TRANSFER, PREPARE, messageProtocol, Enum.Events.EventStatus.SUCCESS)
      test.equal(result, true)
      test.end()
    })

    produceParticipantMessageTest.test('produce a participant message using topicMap', async (test) => {
      const ModuleProxy = Proxyquire('../../../../src/util/kafka', {
        '../../enums': {
          topicMap: {
            transfer: {
              prepare: {
                functionality: 'transfer',
                action: 'prepare'
              }
            }
          }
        }
      })
      const result = await ModuleProxy.produceParticipantMessage(Config.KAFKA_CONFIG, KafkaProducer, participantName, TRANSFER, PREPARE, messageProtocol, Enum.Events.EventStatus.SUCCESS)
      test.equal(result, true)
      test.end()
    })

    produceParticipantMessageTest.test('produce a notification message using topicMap', async (test) => {
      const ModuleProxy = Proxyquire('../../../../src/util/kafka', {
        '../../enums': {
          topicMap: {
            transfer: {
              prepare: {
                functionality: 'transfer',
                action: 'prepare'
              }
            }
          }
        }
      })
      const result = await ModuleProxy.produceParticipantMessage(Config.KAFKA_CONFIG, KafkaProducer, participantName, Enum.Events.Event.Type.NOTIFICATION, Enum.Events.Event.Action.ABORT, messageProtocol, Enum.Events.EventStatus.SUCCESS)
      test.equal(result, true)
      test.end()
    })

    produceParticipantMessageTest.test('produce a participant message', async (test) => {
      try {
        await Utility.produceParticipantMessage(Config.KAFKA_CONFIG, KafkaProducer, participantName, TRANSFER, 'invalid', messageProtocol, Enum.Events.EventStatus.SUCCESS)
      } catch (e) {
        test.ok(e instanceof Error)
      }
      test.end()
    })

    produceParticipantMessageTest.end()
  })

  utilityTest.test('commitMessageSync should', commitMessageSyncTest => {
    commitMessageSyncTest.test('commit message when auto commit is disabled', async (test) => {
      const kafkaTopic = 'test-topic'
      const message = 'message'
      const commitMessageSyncStub = sandbox.stub()
      const consumerStub = {
        commitMessageSync: commitMessageSyncStub
      }
      const ConsumerStub = {
        isConsumerAutoCommitEnabled: sandbox.stub().withArgs(kafkaTopic).returns(false),
        getConsumer: sandbox.stub().withArgs(kafkaTopic).returns(consumerStub)
      }
      const UtilityProxy = rewire(`${src}/util/kafka`)

      await UtilityProxy.commitMessageSync(ConsumerStub, kafkaTopic, message)
      test.ok(ConsumerStub.isConsumerAutoCommitEnabled.withArgs(kafkaTopic).calledOnce, 'isConsumerAutoCommitEnabled called once')
      test.ok(commitMessageSyncStub.withArgs(message).calledOnce, 'commitMessageSyncStub called once')
      test.end()
    })

    commitMessageSyncTest.test('skip committing message when auto commit is enabled', async (test) => {
      const kafkaTopic = 'test-topic'
      const message = 'message'
      const commitMessageSyncStub = sandbox.stub()
      const consumerStub = {
        commitMessageSync: commitMessageSyncStub
      }
      const ConsumerStub = {
        isConsumerAutoCommitEnabled: sandbox.stub().withArgs(kafkaTopic).returns(true),
        getConsumer: sandbox.stub().withArgs(kafkaTopic).returns(consumerStub)
      }

      const UtilityProxy = rewire(`${src}/util/kafka`)

      await UtilityProxy.commitMessageSync(ConsumerStub, kafkaTopic, message)
      test.ok(ConsumerStub.isConsumerAutoCommitEnabled.withArgs(kafkaTopic).calledOnce, 'isConsumerAutoCommitEnabled called once')
      test.equal(commitMessageSyncStub.withArgs(message).callCount, 0, 'commitMessageSyncStub not called')
      test.end()
    })

    commitMessageSyncTest.test('skip committing message when auto commit is enabled', async (test) => {
      const kafkaTopic = 'fail-topic'
      const message = 'message'
      const ConsumerStub = {
        isConsumerAutoCommitEnabled: sandbox.stub().withArgs(kafkaTopic).returns(false),
        getConsumer: sandbox.stub().withArgs(kafkaTopic).throwsException(new Error('No Consumer'))
      }

      const UtilityProxy = rewire(`${src}/util/kafka`)
      try {
        await UtilityProxy.commitMessageSync(ConsumerStub, kafkaTopic, message)
        test.fail('No error thrown')
        test.end()
      } catch (err) {
        test.ok(err instanceof Error)
        test.end()
      }
    })

    commitMessageSyncTest.end()
  })

  utilityTest.test('proceed should', async proceedTest => {
    let proceedSandbox
    let commitMessageSyncStub
    let produceGeneralMessageStub
    let params
    let message
    const transferId = Uuid()
    const from = 'from'
    const extList = []
    const kafkaTopic = 'kafkaTopic'
    const consumer = 'consumer'
    const producer = 'producer'
    const successState = Enum.Events.EventStatus.SUCCESS
    const eventDetail = { functionality: 'functionality', action: 'action' }
    const UtilityProxy = rewire(`${src}/util/kafka/index`)

    proceedTest.beforeEach(test => {
      // `proceed` mutates the message so reset it after every test
      message = {
        value: {
          content: {
            payload: {
              extensionList: extList
            },
            headers: {
              'fspiop-destination': 'dfsp'
            }
          },
          from
        }
      }

      params = { message, transferId, kafkaTopic, consumer, decodedPayload: message.value.content.payload, producer }
      proceedSandbox = Sinon.createSandbox()
      commitMessageSyncStub = sandbox.stub().returns(Promise.resolve())
      produceGeneralMessageStub = sandbox.stub().returns(Promise.resolve())
      UtilityProxy.__set__('commitMessageSync', commitMessageSyncStub)
      UtilityProxy.__set__('produceGeneralMessage', produceGeneralMessageStub)
      test.end()
    })

    proceedTest.afterEach(test => {
      proceedSandbox.restore()
      test.end()
    })

    proceedTest.test('commitMessageSync when consumerCommit and produce toDestination', async test => {
      const opts = { consumerCommit: true, eventDetail, toDestination: true }
      try {
        const result = await UtilityProxy.proceed(Config.KAFKA_CONFIG, params, opts)
        test.ok(commitMessageSyncStub.calledOnce, 'commitMessageSyncStub not called')
        test.ok(produceGeneralMessageStub.withArgs(Config.KAFKA_CONFIG, producer, eventDetail.functionality, eventDetail.action, message.value, successState).calledOnce, 'produceGeneralMessageStub called once')
        test.equal(result, true, 'result returned')
      } catch (err) {
        test.fail(err.message)
      }

      test.end()
    })

    proceedTest.test('commitMessageSync when consumerCommit and toDestination is string', async test => {
      const opts = { consumerCommit: true, eventDetail, toDestination: 'dfsp1' }
      try {
        const result = await UtilityProxy.proceed(Config.KAFKA_CONFIG, params, opts)
        test.ok(commitMessageSyncStub.calledOnce, 'commitMessageSyncStub not called')
        test.ok(produceGeneralMessageStub.withArgs(Config.KAFKA_CONFIG, producer, eventDetail.functionality, eventDetail.action, message.value, successState).calledOnce, 'produceGeneralMessageStub not called')
        test.equal(result, true, 'result returned')
      } catch (err) {
        test.fail(err.message)
      }

      test.end()
    })

    proceedTest.test('produce message when messageKey is specified', async test => {
      const opts = { consumerCommit: true, eventDetail, messageKey: '101' }
      try {
        const result = await UtilityProxy.proceed(Config.KAFKA_CONFIG, params, opts)
        test.ok(commitMessageSyncStub.calledOnce, 'commitMessageSyncStub not called')
        test.ok(produceGeneralMessageStub.withArgs(Config.KAFKA_CONFIG, producer, eventDetail.functionality, eventDetail.action, message.value, successState, '101').calledOnce, 'produceGeneralMessageStub not called')
        test.equal(result, true, 'result returned')
      } catch (err) {
        test.fail(err.message)
      }

      test.end()
    })

    proceedTest.test('produce message when topicNameOverride specified', async test => {
      const opts = { consumerCommit: true, eventDetail, messageKey: '101', topicNameOverride: 'topic-name-override' }
      try {
        const result = await UtilityProxy.proceed(Config.KAFKA_CONFIG, params, opts)
        test.ok(commitMessageSyncStub.calledOnce, 'commitMessageSyncStub not called')
        test.ok(produceGeneralMessageStub.withArgs(Config.KAFKA_CONFIG, producer, eventDetail.functionality, eventDetail.action, message.value, successState, '101', undefined, 'topic-name-override').calledOnce, 'produceGeneralMessageStub not called')
        test.equal(result, true, 'result returned')
      } catch (err) {
        test.fail(err.message)
      }

      test.end()
    })

    proceedTest.test('produce fromSwitch and do not stop timer', async test => {
      const opts = { fromSwitch: true, eventDetail, hubName: 'Hub' }
      try {
        const result = await UtilityProxy.proceed(Config.KAFKA_CONFIG, params, opts)
        test.ok(produceGeneralMessageStub.withArgs(Config.KAFKA_CONFIG, producer, eventDetail.functionality, eventDetail.action, message.value, successState).calledOnce, 'produceGeneralMessageStub not called')
        test.equal(message.value.to, from, 'message destination set to sender')
        test.equal(message.value.from, opts.hubName, 'from set to switch')
        test.equal(result, true, 'result returned')
      } catch (err) {
        test.fail(err.message)
      }

      test.end()
    })

    proceedTest.test('produce fromSwitch without headers', async test => {
      const opts = { fromSwitch: true, eventDetail, hubName: 'Hub' }
      try {
        const localParams = clone(params)
        delete localParams.message.value.content.headers
        const result = await UtilityProxy.proceed(Config.KAFKA_CONFIG, localParams, opts)
        test.ok(produceGeneralMessageStub.withArgs(Config.KAFKA_CONFIG, producer, eventDetail.functionality, eventDetail.action, localParams.message.value, successState).calledOnce, 'produceGeneralMessageStub not called')
        test.equal(localParams.message.value.to, from, 'message destination set to sender')
        test.equal(localParams.message.value.from, opts.hubName, 'from set to switch')
        test.equal(result, true, 'result returned')
      } catch (err) {
        test.fail(err.message)
      }

      test.end()
    })

    proceedTest.test('create error status and end timer', async test => {
      const desc = 'desc'
      const fspiopError = ErrorHandler.Factory.createInternalServerFSPIOPError(desc).toApiErrorObject()
      const opts = { fspiopError }
      try {
        const result = await UtilityProxy.proceed(Config.KAFKA_CONFIG, params, opts)
        test.equal(result, true, 'result returned')
      } catch (err) {
        test.fail(err.message)
      }

      test.end()
    })

    proceedTest.test('create error status and end timer with uriParams', async test => {
      const desc = 'desc'
      const fspiopError = ErrorHandler.Factory.createInternalServerFSPIOPError(desc).toApiErrorObject()
      const opts = { fspiopError }
      try {
        const localParams = MainUtil.clone(params)
        localParams.message.value.content.uriParams = { id: Uuid() }
        const result = await UtilityProxy.proceed(Config.KAFKA_CONFIG, localParams, opts)
        test.equal(result, true, 'result returned')
      } catch (err) {
        test.fail(err.message)
      }

      test.end()
    })

    proceedTest.end()
  })

  utilityTest.end()
})
