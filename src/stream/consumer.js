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

'use strict'

const Promise = require('bluebird')
const EventEmitter = require('events')
const Logger = require('../logger')
const Kafka = require('node-rdkafka')

const Protocol = require('./protocol')

const CONSUMER_MODES = {
  flow: 0,
  poll: 1,
  recursive: 2
}

class Consumer extends EventEmitter {
  constructor (topics = [], config = {
    rdkafka: {
      'group.id': 'kafka',
      'metadata.broker.list': 'localhost:9092',
      'enable.auto.commit': false
      // 'debug': 'all'
    },
    options: {
      mode: CONSUMER_MODES.flow,
      batchSize: 10,
      pollFrequency: 10, // only applicable for poll mode
      messageCharset: 'utf8',
      messageAsJSON: true
    },
    topic: {},
    logger: Logger
  }
  ) {
    super()
    if (!config) {
      throw new Error('missing a config object')
    }

    let { logger } = config
    logger.silly('Consumer::constructor() - start')
    this._topics = topics
    this._config = config
    this._status = {}
    this._status.runningInConsumeOnceMode = false
    this._status.runningInConsumeMode = false
    logger.silly('Consumer::constructor() - end')
  }

  connect () {
    let { logger } = this._config
    logger.silly('Consumer::connect() - start')
    return new Promise((resolve, reject) => {
      this._consumer = new Kafka.KafkaConsumer(this._config.rdkafka, this._config.topic)

      this._consumer.on('event.log', log => {
        logger.silly(log.message)
      })

      this._consumer.on('event.error', error => {
        logger.silly('error from consumer')
        logger.silly(error)
        super.emit('error', error)
      })

      this._consumer.on('error', error => {
        super.emit('error', error)
      })

      this._consumer.on('disconnected', () => {
        logger.warn('disconnected.')
      })

      this._consumer.on('ready', arg => {
        logger.debug(`node-rdkafka v${Kafka.librdkafkaVersion} ready - ${JSON.stringify(arg)}`)
        super.emit('ready', arg)
        this.subscribe()
        logger.silly('Consumer::connect() - end')
        resolve(true)
      })

      logger.silly('Connecting..')
      this._consumer.connect(null, (error, metadata) => {
        if (error) {
          super.emit('error', error)
          logger.silly('Consumer::connect() - end')
          return reject(error)
        }
        // this.subscribe()
        logger.silly('Consumer metadata:')
        logger.silly(metadata)
        // resolve(true)
      })

      logger.silly('Registering data event..')
      this._consumer.on('data', message => {
        logger.silly(`Consumer::onData() - message: ${JSON.stringify(message)}`)
        var returnMessage = { ...message }
        if (message instanceof Array) {
          returnMessage.map(msg => {
            var parsedValue = Protocol.parseValue(msg.value, this._config.options.messageCharset, this._config.options.messageAsJSON)
            msg.value = parsedValue
          })
        } else {
          var parsedValue = Protocol.parseValue(returnMessage.value, this._config.options.messageCharset, this._config.options.messageAsJSON)
          returnMessage.value = parsedValue
        }
        super.emit('message', returnMessage)
      })
    })
  }

  disconnect (cb = () => {}) {
    let { logger } = this._config
    logger.silly('Consumer::disconnect() - start')
    this._consumer.disconnect(cb)
    logger.silly('Consumer::disconnect() - end')
  }

  subscribe (topics = null) {
    let { logger } = this._config
    logger.silly('Consumer::subscribe() - start')
    if (topics) {
      this._topics = topics
    }

    if (this._topics) {
      this._config.logger.silly(`Consumer::subscribe() - subscribing too [${this._topics}]`)
      this._consumer.subscribe(this._topics)
    }
    logger.silly('Consumer::subscribe() - end')
  }

  consume (workDoneCb = (error, messages) => {}) {
    let { logger } = this._config
    logger.silly('Consumer::consume() - start')

    switch (this._config.options.mode) {
      case CONSUMER_MODES.poll:
        if (this._config.options.batchSize && typeof this._config.options.batchSize === 'number') {
          this._consumePoller(this._config.options.pollFrequency, this._config.options.batchSize, workDoneCb)
        } else {
          // throw error
          throw new Error('batchSize option is not valid - Select an integer greater then 0')
        }
        break
      case CONSUMER_MODES.recursive:
        if (this._config.options.batchSize && typeof this._config.options.batchSize === 'number') {
          super.on('recursive', (error, messages) => {
            this._consumeRecursive(this._config.options.batchSize, workDoneCb)
          })
          this._consumeRecursive(this._config.options.batchSize, workDoneCb)
        } else {
          // throw error
          throw new Error('batchSize option is not valid - Select an integer greater then 0')
        }
        break
      case CONSUMER_MODES.flow:
        this._consumeFlow(workDoneCb)
        break
      default:
        this._consumeFlow(workDoneCb)
    }
    logger.silly('Consumer::consume() - end')
  }

  _consumePoller (pollFrequency = 10, batchSize = 1, workDoneCb = (error, messages) => {}) {
    let { logger } = this._config
    setInterval(() => {
      this._consumer.consume(batchSize, (error, messages) => {
        if (error || !messages.length) {
          if (error) {
            logger.error(`Consumer::_consumerPoller() - ERROR - ${error}`)
          } else {
            // logger.debug(`Consumer::_consumerPoller() - POLL EMPTY PING`)
          }
        } else {
          messages.map(msg => {
            var parsedValue = Protocol.parseValue(msg.value, this._config.options.messageCharset, this._config.options.messageAsJSON)
            msg.value = parsedValue
          })
          if (this._config.options.messageAsJSON) {
            logger.debug(`Consumer::_consumerRecursive() - messages[${messages.length}]: ${JSON.stringify(messages)}}`)
          } else {
            logger.debug(`Consumer::_consumerRecursive() - messages[${messages.length}]: ${messages}}`)
          }
          workDoneCb(error, messages)
          super.emit('batch', messages)
        }
      })
    }, pollFrequency)
  }

  _consumeRecursive (batchSize = 1, workDoneCb = (error, messages) => {}) {
    let { logger } = this._config
    this._consumer.consume(batchSize, (error, messages) => {
      if (error || !messages.length) {
        return this._consumeRecursive(batchSize, workDoneCb)
      } else {
        messages.map(msg => {
          var parsedValue = Protocol.parseValue(msg.value, this._config.options.messageCharset, this._config.options.messageAsJSON)
          msg.value = parsedValue
        })
        if (this._config.options.messageAsJSON) {
          logger.debug(`Consumer::_consumerRecursive() - messages[${messages.length}]: ${JSON.stringify(messages)}}`)
        } else {
          logger.debug(`Consumer::_consumerRecursive() - messages[${messages.length}]: ${messages}}`)
        }
        workDoneCb(error, messages)
        super.emit('recursive', error, messages)
        super.emit('batch', messages)
        return true
      }
    })
  }

  _consumeFlow (workDoneCb = (error, message) => {}) {
    let { logger } = this._config
    this._consumer.consume((error, message) => {
      if (error || !message) {

      } else {
        var parsedValue = Protocol.parseValue(message.value, this._config.options.messageCharset, this._config.options.messageAsJSON)
        message.value = parsedValue
        if (this._config.options.messageAsJSON) {
          logger.debug(`Consumer::_consumerFlow() - message: ${JSON.stringify(message)}`)
        } else {
          logger.debug(`Consumer::_consumerFlow() - message: ${message}`)
        }
        workDoneCb(error, message)
        // super.emit('batch', message) // not applicable in flow mode since its one message at a time
      }
    })
  }

  // TODO: WRITE CONSUME ONCE
  consumeOnce (batchSize = 1, workDoneCb = (error, message) => {}, charset = 'utf8', asJSON = true) {
    let { logger } = this._config
    logger.silly('Consumer::consume() - start')
    this._consumer.resume(this._topics)
    return new Promise((resolve, reject) => {
      this._consumer.on('data', message => {
        logger.silly(`Consumer::consume() - message: ${JSON.stringify(message)}`)

        var parsedValue = Protocol.parseValue(message.value, charset, asJSON)
        message.value = parsedValue
        // super.emit('message', message)
        this._consumer.pause(this._topics)
        resolve(message)
      })

      // setTimeout(() => {
      //   reject()
      // }, CONSUME_ONE_TIMEOUT)
      if (this._status.runningInConsumeOnceMode === false) {
        this._status.runningInConsumeOnceMode = true
        this._status.runningInConsumeMode = false
        this._consumer.consume(batchSize, workDoneCb)
      }
    })
    // logger.silly('Consumer::consume() - end')
  }

  commit (topicPartitions = null) {
    let { logger } = this._config
    logger.silly('Consumer::commit() - start')
    this._consumer.commit(topicPartitions)
    logger.silly('Consumer::commit() - end')
  }

  commitMessage (msg) {
    let { logger } = this._config
    logger.silly('Consumer::commitMessage() - start')
    this._consumer.commitMessage(msg)
    logger.silly('Consumer::commitMessage() - end')
  }
}
//
// class Stream extends Consumer {
//   constructor (consumerConfig = {
//     'group.id': 'kafka',
//     'metadata.broker.list': 'localhost:9092'
//   }, globalConfig, topicConfig
//   ) {
//     super(consumerConfig, globalConfig, topicConfig)
//
//     this._stream = this._consumer.createReadStream(globalConfig, topicConfig, {
//       topics: ['librdtesting-01']
//     })
//   }
//
//   // connect () {
//   //   this._consumer.connect()
//   // }
//
//   on (type, func) {
//     this._stream.on(type, func)
//   }
// }

// TODO: WRITE STREAM CONSUMER

// exports.Consumer = Consumer
// exports.Stream = Consumer

var testConsumer = async () => {
  Logger.info('testConsumer::start')

  var c = new Consumer(['test1'])

  Logger.info('testConsumer::connect::start')
  var connectionResult = await c.connect()
  Logger.info('testConsumer::connect::end')
  // c.connect().then(result => {
  //   Logger.info(`Connected result=${result}`)
  //
  //   Logger.info('subscribing')
  //   c.subscribe()
  //
  //   Logger.info('consuming')
  //   c.consume()
  // }).catch(error => Logger.error(error))

  Logger.info(`Connected result=${connectionResult}`)

  // Logger.info('testConsumer::subscribe::start')
  // c.subscribe()
  // Logger.info('testConsumer::subscribe::end')

  Logger.info('testConsumer::consume::start1')

  c.consume((error, message) => {
    if (error) {
      Logger.info(`WTDSDSD!!! error ${error}`)
    }
    if (message) { // check if there is a valid message comming back
      Logger.info(`Message Received by callback function - ${JSON.stringify(message)}`)

      // lets check if we have received a batch of messages or single. This is dependant on the Consumer Mode
      if (Array.isArray(message) && message.length != null && message.length > 0) {
        message.forEach(msg => {
          c.commitMessage(msg)
        })
      }
    } else {
      c.commitMessage(message)
    }
  })

  Logger.info('testConsumer::consume::end1')

  c.on('ready', arg => Logger.info(`onReady: ${JSON.stringify(arg)}`))
  c.on('message', message => Logger.info(`onMessage: ${message.offset}, ${JSON.stringify(message.value)}`))
  c.on('batch', message => Logger.info(`onBatch: ${JSON.stringify(message)}`))

  Logger.info('testConsumer::end')
}

testConsumer()


// //
//
// var testKafkaLib = () => {
//   var consumer = new Kafka.KafkaConsumer({
//     // 'debug': 'all',
//     'metadata.broker.list': 'localhost:9092',
//     'group.id': 'node-rdkafka-consumer-flow-example',
//     'enable.auto.commit': false
//   })
//
//   var topicName = 'test'
//
// // logging debug messages, if debug is enabled
//   consumer.on('event.log', function (log) {
//     console.log(log)
//   })
//
// // logging all errors
//   consumer.on('event.error', function (err) {
//     console.error('Error from consumer')
//     console.error(err)
//   })
//
// // counter to commit offsets every numMessages are received
//   var counter = 0
//   var numMessages = 5
//
//   consumer.on('ready', function (arg) {
//     console.log('consumer ready.' + JSON.stringify(arg))
//
//     consumer.subscribe([topicName])
//     // start consuming messages
//     consumer.consume()
//   })
//
//   consumer.on('data', function (m) {
//     counter++
//
//     // committing offsets every numMessages
//     if (counter % numMessages === 0) {
//       console.log('calling commit')
//       consumer.commit(m)
//     }
//
//     // Output the actual message contents
//     console.log(JSON.stringify(m))
//     console.log(m.value.toString())
//   })
//
//   consumer.on('disconnected', function (arg) {
//     console.log('consumer disconnected. ' + JSON.stringify(arg))
//   })
//
// // starting the consumer
//   consumer.connect()
//
// // stopping this example after 30s
//   setTimeout(function () {
//     consumer.disconnect()
//   }, 30000)
// }
//
// // testKafkaLib()
