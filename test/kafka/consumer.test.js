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
const Consumer = require('../../src/kafka').Consumer
const ConsumerEnums = require('../../src/kafka').Consumer.ENUMS
const Logger = require('../../src/logger')
const Kafka = require('node-rdkafka')
// const EventEmitter = require('events')

const Sinon = require('sinon')

const KafkaStubs = require('./KafkaStub')

Test('Consumer test', (consumerTests) => {
  let sandbox
  // let clock
  let config = {}
  let topicsList = []

  // lets setup the tests
  consumerTests.beforeEach((test) => {
    sandbox = Sinon.sandbox.create()
    // clock = Sinon.useFakeTimers({
    //   now: Date.now(),
    //   shouldAdvanceTime: true
    // })

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
        return new KafkaStubs.KafkaConsumer()
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
    assert.ok(c, 'Consumer instance created')
    assert.ok(ConsumerSpy.calledOnce, 'Consumer constructor called once')
    assert.end()
  })

  consumerTests.test('Test Consumer::connect', (assert) => {
    assert.plan(2)
    var c = new Consumer(topicsList, config)
    c.on('ready', arg => {
      console.log(`onReady: ${JSON.stringify(arg)}`)
      assert.ok(Sinon.match(arg, true), 'on Ready event received')
    })
    c.connect().then(result => {
      assert.ok(Sinon.match(result, true))
    })
  })

  consumerTests.test('Test Consumer::disconnect', (assert) => {
    var discoCallback = (err, metrics) => {
      if (err) {
        Logger.error(err)
      }
      assert.equal(typeof metrics.connectionOpened, 'number')
      assert.end()
    }
    var c = new Consumer(topicsList, config)
    c.connect().then(result => {
      c.disconnect(discoCallback)
    })
  })

  consumerTests.test('Test Consumer::getWatermarkOffsets', (assert) => {
    var c = new Consumer(topicsList, config)
    c.connect().then(result => {
      assert.ok(Sinon.match(result, true))
      var waterMarkOffset = c.getWatermarkOffsets(topicsList, 0)
      assert.ok(waterMarkOffset, 'waterMarkOffset result exists')
      assert.ok(Sinon.match(waterMarkOffset, KafkaStubs.watermarkOffsetSampleStub), 'waterMarkOffset results match')
      assert.end()
    })
  })

  consumerTests.test('Test Consumer::getMetadata', (assert) => {
    var metaDatacCb = (error, metadata) => {
      if (error) {
        Logger.error(error)
      }
      assert.ok(metadata, 'metadata object exists')
      assert.ok(Sinon.match(metadata, KafkaStubs.metadataSampleStub), 'metadata objects match')
      assert.end()
    }
    var c = new Consumer(topicsList, config)
    c.connect().then(result => {
      assert.ok(Sinon.match(result, true))
      c.getMetadata(null, metaDatacCb)
    })
  })

  consumerTests.test('Test Consumer::commit', (assert) => {
    var c = new Consumer(topicsList, config)
    c.connect().then(result => {
      assert.ok(Sinon.match(result, true))
      c.commit(topicsList)
      assert.ok(true, 'commit passed')
      assert.end()
    })
  })

  consumerTests.test('Test Consumer::commitSync', (assert) => {
    var c = new Consumer(topicsList, config)
    c.connect().then(result => {
      assert.ok(Sinon.match(result, true))
      c.commitSync(topicsList)
      assert.ok(true, 'commit passed')
      assert.end()
    })
  })

  consumerTests.test('Test Consumer::commitMessage', (assert) => {
    var c = new Consumer(topicsList, config)
    c.connect().then(result => {
      assert.ok(Sinon.match(result, true))
      c.commitMessage(KafkaStubs.messageSampleStub)
      assert.ok(true, 'commit passed')
      assert.end()
    })
  })

  consumerTests.test('Test Consumer::commitMessageSync', (assert) => {
    var c = new Consumer(topicsList, config)
    c.connect().then(result => {
      assert.ok(Sinon.match(result, true))
      c.commitMessageSync(KafkaStubs.messageSampleStub)
      assert.ok(true, 'commit passed')
      assert.end()
    })
  })

  consumerTests.test('Test Consumer::consumeOnce - Not Implemented', (assert) => {
    var c = new Consumer(topicsList, config)
    c.connect().then(result => {
      assert.ok(Sinon.match(result, true))
      try {
        c.consumeOnce((error, message) => {
          return new Promise((resolve, reject) => {
            if (error) {
              Logger.info(`WTDSDSD!!! error ${error}`)
              reject(error)
            }
            resolve(true)
          })
        })
      } catch (error) {
        Logger.error(error)
        assert.equals(error.message.toString(), 'Not implemented')
        assert.end()
      }
    })
  })

  consumerTests.test('Test Consumer::consume flow sync=false, messageAsJson=true', (assert) => {
    assert.plan(5)
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

    // consume 'ready' event
    c.on('ready', arg => {
      console.log(`onReady: ${JSON.stringify(arg)}`)
      assert.ok(Sinon.match(arg, true), 'on Ready event received')
    })
    // consume 'message' event
    c.on('message', message => {
      console.log(`onMessage: ${message.offset}, ${JSON.stringify(message.value)}`)
      assert.ok(message, 'on Message event received')
    })

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
            // assert.end()
            assert.equals(typeof message.value, 'object')
            assert.ok(message, 'message processed')
          } else {
            resolve(false)
            assert.fail('message not processed')
            // assert.end()
          }
         // resolve(true)
        })
      })
      // assert.end()
    })
  })

  consumerTests.test('Test Consumer::consume flow sync=false, messageAsJson=false', (assert) => {
    assert.plan(5)
    config = {
      options: {
        mode: ConsumerEnums.CONSUMER_MODES.flow,
        batchSize: 1,
        recursiveTimeout: 100,
        messageCharset: 'utf8',
        messageAsJSON: false,
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

    // consume 'ready' event
    c.on('ready', arg => {
      console.log(`onReady: ${JSON.stringify(arg)}`)
      assert.ok(Sinon.match(arg, true), 'on Ready event received')
    })
    // consume 'message' event
    c.on('message', message => {
      console.log(`onMessage: ${message.offset}, ${JSON.stringify(message.value)}`)
      assert.ok(message, 'on Message event received')
    })

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
            // assert.end()
            assert.equals(typeof message.value, 'string')
            assert.ok(message, 'message processed')
          } else {
            resolve(false)
            assert.fail('message not processed')
            // assert.end()
          }
          // resolve(true)
        })
      })
      // assert.end()
    })
  })

  consumerTests.test('Test Consumer::consume flow sync=true, messageAsJson=true', (assert) => {
    assert.plan(5)
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

    // consume 'ready' event
    c.on('ready', arg => {
      console.log(`onReady: ${JSON.stringify(arg)}`)
      assert.ok(Sinon.match(arg, true), 'on Ready event received')
    })
    // consume 'message' event
    c.on('message', message => {
      console.log(`onMessage: ${message.offset}, ${JSON.stringify(message.value)}`)
      assert.ok(message, 'on Message event received')
    })

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
            assert.equals(typeof message.value, 'object')
            // assert.end()
          } else {
            resolve(false)
            assert.fail('message not processed')
            // assert.end()
          }
          // resolve(true)
        })
      })
      // assert.end()
    })
  })


  consumerTests.test('Test Consumer::consume flow sync=true, messageAsJson=false', (assert) => {
    assert.plan(5)
    config = {
      options: {
        mode: ConsumerEnums.CONSUMER_MODES.flow,
        batchSize: 1,
        recursiveTimeout: 100,
        messageCharset: 'utf8',
        messageAsJSON: false,
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

    // consume 'ready' event
    c.on('ready', arg => {
      console.log(`onReady: ${JSON.stringify(arg)}`)
      assert.ok(Sinon.match(arg, true), 'on Ready event received')
    })
    // consume 'message' event
    c.on('message', message => {
      console.log(`onMessage: ${message.offset}, ${JSON.stringify(message.value)}`)
      assert.ok(message, 'on Message event received')
    })

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
            assert.equals(typeof message.value, 'string')
            // assert.end()
          } else {
            resolve(false)
            assert.fail('message not processed')
            // assert.end()
          }
          // resolve(true)
        })
      })
      // assert.end()
    })
  })

  consumerTests.test('Test Consumer::consume poller sync=false, messageAsJson=false', (assert) => {
    config = {
      options: {
        mode: ConsumerEnums.CONSUMER_MODES.poll,
        batchSize: 1,
        recursiveTimeout: 100,
        messageCharset: 'utf8',
        messageAsJSON: false,
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

    // consume 'ready' event
    c.on('ready', arg => {
      console.log(`onReady: ${JSON.stringify(arg)}`)
      assert.ok(Sinon.match(arg, true), 'on Ready event received')
    })
    // consume 'message' event
    c.on('message', message => {
      console.log(`onMessage: ${message.offset}, ${JSON.stringify(message.value)}`)
      assert.ok(message, 'on Message event received')
    })

    c.on('batch', messages => {
      console.log(`onBatch: ${JSON.stringify(messages)}`)
      assert.ok(messages, 'on Batch event received')
      assert.ok(Array.isArray(messages), 'batch of messages received')
    })

    var pollCount = 0

    c.connect().then(result => {
      assert.ok(Sinon.match(result, true))

      c.consume((error, message) => {
        return new Promise((resolve, reject) => {
          pollCount = pollCount + 1
          if (pollCount > 1) {
            c.disconnect()
            assert.ok(true, 'Message processed once by the poller consumer')
            assert.end()
          } else {
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
              assert.ok(Array.isArray(message), 'batch of messages received')
              // c.disconnectåct()
              // assert.end()
              // process.exit(0)
            } else {
              resolve(false)
              // assert.end()
              c.disconnect()
              assert.fail('message not processed')
              // process.exit(0)
            }
            // resolve(true)
          }
        })
      })
      // assert.end()
    })
  })

  consumerTests.test('Test Consumer::consume poller sync=true, messageAsJson=true', (assert) => {
    config = {
      options: {
        mode: ConsumerEnums.CONSUMER_MODES.poll,
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

    // consume 'ready' event
    c.on('ready', arg => {
      console.log(`onReady: ${JSON.stringify(arg)}`)
      assert.ok(Sinon.match(arg, true), 'on Ready event received')
    })
    // consume 'message' event
    c.on('message', message => {
      console.log(`onMessage: ${message.offset}, ${JSON.stringify(message.value)}`)
      assert.ok(message, 'on Message event received')
    })

    c.on('batch', messages => {
      console.log(`onBatch: ${JSON.stringify(messages)}`)
      assert.ok(messages, 'on Batch event received')
      assert.ok(Array.isArray(messages), 'batch of messages received')
    })

    var pollCount = 0

    c.connect().then(result => {
      assert.ok(Sinon.match(result, true))

      c.consume((error, message) => {
        return new Promise((resolve, reject) => {
          pollCount = pollCount + 1
          if (pollCount > 1) {
            c.disconnect()
            assert.ok(true, 'Message processed once by the poller consumer')
            assert.end()
          } else {
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
              assert.ok(Array.isArray(message), 'batch of messages received')
              // c.disconnect()
              // assert.end()
              // process.exit(0)
            } else {
              resolve(false)
              // assert.end()
              c.disconnect()
              assert.fail('message not processed')
              // process.exit(0)
            }
            // resolve(true)
          }
        })
      })
      // assert.end()
    })
  })

  consumerTests.test('Test Consumer::consume recursive sync=false, messageAsJson=true', (assert) => {
    config = {
      options: {
        mode: ConsumerEnums.CONSUMER_MODES.recursive,
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

    // consume 'ready' event
    c.on('ready', arg => {
      console.log(`onReady: ${JSON.stringify(arg)}`)
      assert.ok(Sinon.match(arg, true), 'on Ready event received')
    })
    // consume 'message' event
    c.on('message', message => {
      console.log(`onMessage: ${message.offset}, ${JSON.stringify(message.value)}`)
      assert.ok(message, 'on Message event received')
    })

    c.on('batch', messages => {
      console.log(`onBatch: ${JSON.stringify(messages)}`)
      assert.ok(messages, 'on Batch event received')
      assert.ok(Array.isArray(messages), 'batch of messages received')
    })

    var recursiveCount = 0

    c.connect().then(result => {
      assert.ok(Sinon.match(result, true))

      c.consume((error, message) => {
        return new Promise((resolve, reject) => {
          recursiveCount = recursiveCount + 1
          if (recursiveCount > 1) {
            c.disconnect()
            assert.ok(true, 'Message processed once by the recursive consumer')
            assert.end()
          } else {
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
              assert.ok(Array.isArray(message), 'batch of messages received')
              // assert.end()
              // process.exit(0)
            } else {
              resolve(false)
              assert.fail('message not processed')
              assert.end()
              // process.exit(0)
            }
            // resolve(true)
          }
        })
      })
      // assert.end()
    })
    // c.disconnect()
  })

  consumerTests.test('Test Consumer::consume recursive sync=true, messageAsJson=true', (assert) => {
    // assert.plan(2 * 10 + 1)

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

    var c = new Consumer(topicsList, config)

    // consume 'ready' event
    c.on('ready', arg => {
      console.log(`onReady: ${JSON.stringify(arg)}`)
      assert.ok(Sinon.match(arg, true), 'on Ready event received')
    })
    // consume 'message' event
    c.on('message', message => {
      console.log(`onMessage: ${message.offset}, ${JSON.stringify(message.value)}`)
      assert.ok(message, 'on Message event received')
    })

    c.on('batch', messages => {
      console.log(`onBatch: ${JSON.stringify(messages)}`)
      assert.ok(messages, 'on Batch event received')
      assert.ok(Array.isArray(messages), 'batch of messages received')
    })

    var recursiveCount = 0

    c.connect().then(result => {
      assert.ok(Sinon.match(result, true))

      c.consume((error, message) => {
        return new Promise((resolve, reject) => {
          recursiveCount = recursiveCount + 1
          if (recursiveCount > 1) {
            c.disconnect()
            assert.ok(true, 'Message processed once by the recursive consumer')
            assert.end()
          } else {
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
              assert.ok(Array.isArray(message), 'batch of messages received')
              // assert.end()
              // process.exit(0)
            } else {
              resolve(false)
              assert.fail('message not processed')
              // assert.end()
              // process.exit(0)
            }
            // resolve(true)
          }
        })
      })
      // assert.end()
    })
  })

  consumerTests.end()
})
