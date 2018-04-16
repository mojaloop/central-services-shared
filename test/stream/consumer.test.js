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

const Consumer = require('../../src/stream/consumer').Consumer
const ConsumerEnums = require('../../src/stream/consumer').ENUMS
const Logger = require('../../src/logger')

// TODO: TO BE REWORKED INTO UNIT/INTEGRATION TEST FRAMEWORK
var testConsumer = async () => {
  Logger.info('testConsumer::start')

  var c = new Consumer(['test1'], {
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
  })

  Logger.info('testConsumer::connect::start')
  var connectionResult = await c.connect()
  Logger.info('testConsumer::connect::end')

  Logger.info(`Connected result=${connectionResult}`)

  // Logger.info('testConsumer::subscribe::start')
  // c.subscribe()
  // Logger.info('testConsumer::subscribe::end')

  Logger.info('testConsumer::consume::start')

  c.consume((error, message) => {
    return new Promise((resolve, reject) => {
      if (error) {
        Logger.info(`WTDSDSD!!! error ${error}`)
        // resolve(false)
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
      } else {
        resolve(false)
      }
      // resolve(true)
    })
  })
  Logger.info('testConsumer::consume::end')

  c.on('ready', arg => Logger.info(`onReady: ${JSON.stringify(arg)}`))
  c.on('message', message => Logger.info(`onMessage: ${message.offset}, ${JSON.stringify(message.value)}`))
  c.on('batch', message => Logger.info(`onBatch: ${JSON.stringify(message)}`))

  Logger.info('testConsumer::end')
}

testConsumer()
