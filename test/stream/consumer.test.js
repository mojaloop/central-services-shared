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

 * Lazola Lucas <lazola.lucas@modusbox.com>
 * Rajiv Mothilal <rajiv.mothilal@modusbox.com>
 * Miguel de Barros <miguel.debarros@modusbox.com>

 --------------
 ******/

/**
 * Kafka Consumer
 * @module Consumer
 */

'use strict'

const Test = require('tapes')(require('tape'))
const Consumer = require('../../src/stream/consumer').Consumer
const ConsumerEnums = require('../../src/stream/consumer').ENUMS
const Logger = require('../../src/logger')
const Kafka = require('node-rdkafka')
const EventEmitter = require('events')

const Sinon = require('sinon')

// KafkaClient Stub
class KafkaClient extends EventEmitter {
  connect (err, info) {
    this.emit('ready', 'true')
  }

  disconnect (err, info) {
  }

  getMetadata (metadataOptions, cb = (err, metadata) => {}) {
    var metadataSample = {
      orig_broker_id: 1,
      orig_broker_name: 'stub-broker',
      brokers: [
        {
          id: 0,
          host: 'localhost',
          port: 9092
        }
      ],
      topics: [
        {
          name: 'test',
          partitions: [
            {
              id: 0,
              leader: 0,
              replicas: [1],
              isrs: [1]
            }
          ]
        }
      ]
    }

    if (cb) {
      cb(null, metadataSample)
    }
  }
}

// KafkaConsumer Stub
class KafkaConsumer extends KafkaClient {
  setDefaultConsumeTimeout (timeoutMs) {
  }

  subscribe (topics) {
    return topics
  }

  consume (cb) {

  }

  consume (number, cb) {
    if ((number && typeof number === 'number') || (number && cb)) {
      if (cb === undefined) {
        cb = function () {}
      } else if (typeof cb !== 'function') {
        throw new TypeError('Callback must be a function')
      }
    } else {
      // See https://github.com/Blizzard/node-rdkafka/issues/220
      // Docs specify just a callback can be provided but really we needed
      // a fallback to the number argument
      // @deprecated
      if (cb === undefined) {
        if (typeof number === 'function') {
          cb = number
        } else {
          cb = function () {}
        }
      }
    }

    var encoding = 'utf8'

    var bufferedMessage = Buffer.from(JSON.stringify({
      hello: 'world'
    }), encoding)

    var messageSample = {
      value: bufferedMessage,
      topic: 'test',
      partition: 0,
      offset: 1,
      key: 'key',
      size: bufferedMessage.length,
      timestamp: (new Date()).getTime()
    }

    if (number > 0) {
      var messageBatchSample = [0, 1, 2, 3, 4, 5, 6, 7, 9]

      messageBatchSample = messageBatchSample.map(index => {
        var newMessageSample = {...messageSample}
        newMessageSample.key = index
        newMessageSample.offset = index
        newMessageSample.timestamp = (new Date()).getTime()
        return newMessageSample
      })

      cb(null, messageBatchSample)
      this.emit('batch', messageBatchSample)
    }
    cb(null, messageSample)
    this.emit('data', messageSample)
  }

  commit (topicPartition) {
    return topicPartition
  }

  commitMessage (msg) {
    return msg
  }

  commitSync (topicPartition) {
    return topicPartition
  }

  commitMessageSync (msg) {
    return msg
  }

  getWatermarkOffsets (topic, partition) {
    var watermarkOffsetSample = {
      high: 10,
      low: 0
    }
    return watermarkOffsetSample
  }

  resume (topicPartitions) {
  }

  pause (topicPartitions) {
  }
}

// it('', (assert) => {
//
// })

Test('Consumer test', (consumerTests) => {
  let sandbox
  let clock
  let config = {}
  let topicsList = []

  // lets setup the tests
  consumerTests.beforeEach((test) => {
    sandbox = Sinon.sandbox.create()
    clock = Sinon.useFakeTimers({
      now: Date.now(),
      shouldAdvanceTime: false
    })

    config = {
      options: {
        mode: ConsumerEnums.CONSUMER_MODES.recursive,
        batchSize: 1,
        recursiveTimeout: 100,
        messageCharset: 'utf8',
        messageAsJSON: true,
        sync: true,
        consumeTimeout: 1000
      },
      rdkafkaConf: {
        'group.id': 'kafka-test',
        'metadata.broker.list': 'localhost:9092',
        'enable.auto.commit': false
      },
      topicConf: {},
      logger: Logger
    }

    topicsList = ['test']

    sandbox.stub(Kafka, 'KafkaConsumer').callsFake(
      () => {
        return new KafkaConsumer()
      }
    )

    test.end()
  })

  // lets tear down the tests
  consumerTests.afterEach((test) => {
    sandbox.restore()
    test.end()
  })

  consumerTests.test('Test Consumer::constructor', (assert) => {
    const ConsumerSpy = Sinon.spy(Consumer.prototype, 'constructor')
    var c = new ConsumerSpy(topicsList, config)
    assert.ok(ConsumerSpy.calledOnce)
    assert.end()
  })

  consumerTests.test('Test Consumer::connect', (assert) => {
    var c = new Consumer(topicsList, config)
    c.connect().then(result => {
      assert.ok(Sinon.match(result, true))
      assert.end()
      // assert.same(result, true)
    })
    // assert.same(result, true)
  })

  consumerTests.test('Test Consumer::consume flow sync=false', (assert) => {
    config = {
      options: {
        mode: ConsumerEnums.CONSUMER_MODES.flow,
        batchSize: 1,
        recursiveTimeout: 100,
        messageCharset: 'utf8',
        messageAsJSON: true,
        sync: false,
        consumeTimeout: 1000
      },
      rdkafkaConf: {
        'group.id': 'kafka-test',
        'metadata.broker.list': 'localhost:9092',
        'enable.auto.commit': false
      },
      topicConf: {},
      logger: Logger
    }

    var c = new Consumer(topicsList, config)

    c.connect().then(result => {
      assert.ok(Sinon.match(result, true))

      c.consume((error, message) => {
        return new Promise((resolve, reject) => {
          if (error) {
            Logger.info(`WTDSDSD!!! error ${error}`)
            reject(error)
          }
          if (message) { // check if there is a valid message comming back
            Logger.info(`Message Received by callback function - ${JSON.stringify(message)}`)
            // lets check if we have received a batch of messages or single. This is dependant on the Consumer Mode
            if (Array.isArray(message) && message.length != null && message.length > 0) {
              message.forEach(msg => {
                c.commitMessage(msg)
              })
            } else {
              c.commitMessage(message)
            }
            resolve(true)
            assert.end()
          } else {
            resolve(false)
            assert.end()
          }
         // resolve(true)
        })
      })
      // assert.end()
    })
  })

  consumerTests.test('Test Consumer::consume flow sync=true', (assert) => {
    config = {
      options: {
        mode: ConsumerEnums.CONSUMER_MODES.flow,
        batchSize: 1,
        recursiveTimeout: 100,
        messageCharset: 'utf8',
        messageAsJSON: true,
        sync: true,
        consumeTimeout: 1000
      },
      rdkafkaConf: {
        'group.id': 'kafka-test',
        'metadata.broker.list': 'localhost:9092',
        'enable.auto.commit': false
      },
      topicConf: {},
      logger: Logger
    }

    var c = new Consumer(topicsList, config)

    c.connect().then(result => {
      assert.ok(Sinon.match(result, true))

      c.consume((error, message) => {
        return new Promise((resolve, reject) => {
          if (error) {
            Logger.info(`WTDSDSD!!! error ${error}`)
            reject(error)
          }
          if (message) { // check if there is a valid message comming back
            Logger.info(`Message Received by callback function - ${JSON.stringify(message)}`)
            // lets check if we have received a batch of messages or single. This is dependant on the Consumer Mode
            if (Array.isArray(message) && message.length != null && message.length > 0) {
              message.forEach(msg => {
                c.commitMessage(msg)
              })
            } else {
              c.commitMessage(message)
            }
            resolve(true)
            assert.ok(message, 'message processed')
            assert.end()
          } else {
            resolve(false)
            assert.fail('message not processed')
            assert.end()
          }
          // resolve(true)
        })
      })
      // assert.end()
    })
  })

  consumerTests.test('Test Consumer::consume poller sync=false', (assert) => {

    assert.plan(1)

    config = {
      options: {
        mode: ConsumerEnums.CONSUMER_MODES.poll,
        batchSize: 1,
        recursiveTimeout: 100,
        messageCharset: 'utf8',
        messageAsJSON: true,
        sync: false,
        consumeTimeout: 1000
      },
      rdkafkaConf: {
        'group.id': 'kafka-test',
        'metadata.broker.list': 'localhost:9092',
        'enable.auto.commit': false
      },
      topicConf: {},
      logger: Logger
    }

    var c = new Consumer(topicsList, config)

    c.connect().then(result => {
      assert.ok(Sinon.match(result, true))

      c.consume((error, message) => {
        return new Promise((resolve, reject) => {
          if (error) {
            Logger.info(`WTDSDSD!!! error ${error}`)
            reject(error)
          }
          if (message) { // check if there is a valid message comming back
            Logger.info(`Message Received by callback function - ${JSON.stringify(message)}`)
            // lets check if we have received a batch of messages or single. This is dependant on the Consumer Mode
            if (Array.isArray(message) && message.length != null && message.length > 0) {
              message.forEach(msg => {
                c.commitMessage(msg)
              })
            } else {
              c.commitMessage(message)
            }
            resolve(true)
            assert.ok(message, 'message processed')
            // assert.end()
            // process.exit(0)
          } else {
            resolve(false)
            // assert.end()
            assert.fail('message not processed')
            // process.exit(0)
          }
          // resolve(true)
        })
      })
      // assert.end()
    })
  })

  // consumerTests.test('Test Consumer::consume recursive sync=false', (assert) => {
  //
  //   assert.plan(2 * 10 + 1)
  //
  //   config = {
  //     options: {
  //       mode: ConsumerEnums.CONSUMER_MODES.recursive,
  //       batchSize: 1,
  //       recursiveTimeout: 100,
  //       messageCharset: 'utf8',
  //       messageAsJSON: true,
  //       sync: false,
  //       consumeTimeout: 1000
  //     },
  //     rdkafkaConf: {
  //       'group.id': 'kafka-test',
  //       'metadata.broker.list': 'localhost:9092',
  //       'enable.auto.commit': false
  //     },
  //     topicConf: {},
  //     logger: Logger
  //   }
  //
  //   var c = new Consumer(topicsList, config)
  //
  //   c.connect().then(result => {
  //     assert.ok(Sinon.match(result, true))
  //
  //     c.consume((error, message) => {
  //       return new Promise((resolve, reject) => {
  //         if (error) {
  //           Logger.info(`WTDSDSD!!! error ${error}`)
  //           reject(error)
  //         }
  //         if (message) { // check if there is a valid message comming back
  //           Logger.info(`Message Received by callback function - ${JSON.stringify(message)}`)
  //           // lets check if we have received a batch of messages or single. This is dependant on the Consumer Mode
  //           if (Array.isArray(message) && message.length != null && message.length > 0) {
  //             message.forEach(msg => {
  //               c.commitMessage(msg)
  //             })
  //           } else {
  //             c.commitMessage(message)
  //           }
  //           resolve(true)
  //           assert.ok(message, 'message processed')
  //           // assert.end()
  //           // process.exit(0)
  //         } else {
  //           resolve(false)
  //           assert.fail('message not processed')
  //           // assert.end()
  //           // process.exit(0)
  //         }
  //         // resolve(true)
  //       })
  //     })
  //     // assert.end()
  //   })
  // })

  consumerTests.end()
})

// TODO: TO BE REWORKED INTO UNIT/INTEGRATION TEST FRAMEWORK
// var testConsumer = async () => {
//   Logger.info('testConsumer::start')
//
//   var c = new Consumer(['test1'], {
//     options: {
//       mode: ConsumerEnums.CONSUMER_MODES.recursive,
//       batchSize: 1,
//       recursiveTimeout: 100,
//       messageCharset: 'utf8',
//       messageAsJSON: true,
//       sync: true,
//       consumeTimeout: 1000
//     },
//     rdkafkaConf: {
//       'group.id': 'kafka-test',
//       'metadata.broker.list': 'localhost:9092',
//       'enable.auto.commit': false
//     },
//     topicConf: {},
//     logger: Logger
//   })
//
//   Logger.info('testConsumer::connect::start')
//   var connectionResult = await c.connect()
//   Logger.info('testConsumer::connect::end')
//
//   Logger.info(`Connected result=${connectionResult}`)
//
//   // Logger.info('testConsumer::subscribe::start')
//   // c.subscribe()
//   // Logger.info('testConsumer::subscribe::end')
//
//   Logger.info('testConsumer::consume::start')
//
//   c.consume((error, message) => {
//     return new Promise((resolve, reject) => {
//       if (error) {
//         Logger.info(`WTDSDSD!!! error ${error}`)
//         // resolve(false)
//         reject(error)
//       }
//       if (message) { // check if there is a valid message comming back
//         Logger.info(`Message Received by callback function - ${JSON.stringify(message)}`)
//         // lets check if we have received a batch of messages or single. This is dependant on the Consumer Mode
//         if (Array.isArray(message) && message.length != null && message.length > 0) {
//           message.forEach(msg => {
//             c.commitMessage(msg)
//           })
//         } else {
//           c.commitMessage(message)
//         }
//         resolve(true)
//       } else {
//         resolve(false)
//       }
//       // resolve(true)
//     })
//   })
//   Logger.info('testConsumer::consume::end')
//
//   c.on('ready', arg => Logger.info(`onReady: ${JSON.stringify(arg)}`))
//   c.on('message', message => Logger.info(`onMessage: ${message.offset}, ${JSON.stringify(message.value)}`))
//   c.on('batch', message => Logger.info(`onBatch: ${JSON.stringify(message)}`))
//
//   Logger.info('testConsumer::end')
// }
//
// testConsumer()
