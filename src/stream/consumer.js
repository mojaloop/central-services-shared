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
// const debug = require('debug')
// const async = require('async')
const Logger = require('../logger')
const Kafka = require('node-rdkafka')

const Protocol = require('./protocol')

// TODO:  RDKAFKA Consumer code goes here

class Consumer extends EventEmitter {
  constructor (topics = [], config = {
    global: {
      'group.id': 'kafka',
      'metadata.broker.list': 'localhost:9092'
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
    logger.debug('Consumer::constructor() - start')
    this._topics = topics
    this._config = config
    this._status = {}
    this._status.runningInConsumeOnceMode = false
    logger.debug('Consumer::constructor() - end')
  }

  connect () {
    let { logger } = this._config
    logger.debug('Consumer::connect() - start')
    return new Promise((resolve, reject) => {
      this._consumer = new Kafka.KafkaConsumer(this._config.global, this._config.topic)

      this._consumer.on('event.log', log => {
        logger.debug(log.message)
      })

      this._consumer.on('event.error', error => {
        logger.debug('error from consumer')
        logger.debug(error)
        super.emit('error', error)
      })

      this._consumer.on('error', error => {
        super.emit('error', error)
      })

      this._consumer.on('disconnected', () => {
        logger.warn('disconnected.')
      })

      this._consumer.on('ready', arg => {
        logger.info(`node-rdkafka v${Kafka.librdkafkaVersion} ready - ${JSON.stringify(arg)}`)
        super.emit('ready', arg)
        this.subscribe()
        // this._consumer.consume()
        logger.debug('Consumer::connect() - end')
        resolve(true)
      })

      logger.debug('Connecting..')
      this._consumer.connect(null, (error, metadata) => {
        if (error) {
          super.emit('error', error)
          logger.debug('Consumer::connect() - end')
          return reject(error)
        }
        // this.subscribe()
        logger.debug('Consumer metadata:')
        logger.debug(metadata)
        // resolve(true)
      })
    })
  }

  subscribe (topics = null) {
    let { logger } = this._config
    logger.debug('Consumer::subscribe() - start')
    if (topics) {
      this._topics = topics
    }

    if (this._topics) {
      this._config.logger.debug(`Consumer::subscribe() - subscribing too [${this._topics}]`)
      this._consumer.subscribe(this._topics)
    }
    logger.debug('Consumer::subscribe() - end')
  }

  consume (batchSize = 1, workDoneCb = (error, message) => {}, charset = 'utf8', asJSON = true) {
    let { logger } = this._config
    logger.debug('Consumer::consume() - start')

    this._consumer.on('data', message => {
      logger.debug(`Consumer::consume() - message: ${JSON.stringify(message)}`)

      var parsedValue = Protocol.parseValue(message.value, charset, asJSON)
      message.value = parsedValue
      super.emit('message', message)
    })

    this._status.runningInConsumeOnceMode = false
    this._status.runningInConsumeMode = true
    this._consumer.consume(batchSize)
    logger.debug('Consumer::consume() - end')
  }

  consumeOnce (batchSize = 1, workDoneCb = (error, message) => {}, charset = 'utf8', asJSON = true) {
    let { logger } = this._config
    logger.debug('Consumer::consume() - start')
    this._consumer.resume(this._topics)
    return new Promise((resolve, reject) => {
      this._consumer.on('data', message => {
        logger.debug(`Consumer::consume() - message: ${JSON.stringify(message)}`)

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
    // logger.debug('Consumer::consume() - end')
  }


  commit () {
    let { logger } = this._config
    logger.debug('Consumer::commit() - start')
    this._consumer.commit()
    logger.debug('Consumer::commit() - end')
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

  Logger.info('testConsumer::consume::start')
  c.consume()
  Logger.info('testConsumer::consume::end')

// c.subscribe()
// consumer.consume();
// c.on('data', message => Logger.info(message.offset, message.value))

// c.on('first-drain-message', message => Logger.info(message.offset, message.value))
  c.on('ready', arg => Logger.info(`READY! ${JSON.stringify(arg)}`))
  c.on('message', message => Logger.info(`ConMessage: ${message.offset}, ${JSON.stringify(message.value)}`))

  Logger.info('testConsumer::end')
}

testConsumer()
//

var testKafkaLib = () => {
  var consumer = new Kafka.KafkaConsumer({
    // 'debug': 'all',
    'metadata.broker.list': 'localhost:9092',
    'group.id': 'node-rdkafka-consumer-flow-example',
    'enable.auto.commit': false
  })

  var topicName = 'test'

// logging debug messages, if debug is enabled
  consumer.on('event.log', function (log) {
    console.log(log)
  })

// logging all errors
  consumer.on('event.error', function (err) {
    console.error('Error from consumer')
    console.error(err)
  })

// counter to commit offsets every numMessages are received
  var counter = 0
  var numMessages = 5

  consumer.on('ready', function (arg) {
    console.log('consumer ready.' + JSON.stringify(arg))

    consumer.subscribe([topicName])
    // start consuming messages
    consumer.consume()
  })

  consumer.on('data', function (m) {
    counter++

    // committing offsets every numMessages
    if (counter % numMessages === 0) {
      console.log('calling commit')
      consumer.commit(m)
    }

    // Output the actual message contents
    console.log(JSON.stringify(m))
    console.log(m.value.toString())
  })

  consumer.on('disconnected', function (arg) {
    console.log('consumer disconnected. ' + JSON.stringify(arg))
  })

// starting the consumer
  consumer.connect()

// stopping this example after 30s
  setTimeout(function () {
    consumer.disconnect()
  }, 30000)
}

// testKafkaLib()
