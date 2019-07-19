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

/**
 * @module src/handlers/lib
 */

const Mustache = require('mustache')
const Logger = require('../logger')
const Uuid = require('uuid4')
const Kafka = require('./index')
const Enum = require('../enums')

/**
 * @function ParticipantTopicTemplate
 *
 * @description Generates a participant topic name from the 3 inputs which are used in the placeholder topic template for participants found in the default.json
 *
 * @param {string} template - The template for that needs to be populated
 * @param {string} participantName - participant name, retrieved from database. Example: 'dfsp1'
 * @param {string} functionality - the functionality flow. Example: 'transfer'
 * @param {string} action - the action that applies to the flow. Example: 'prepare'
 *
 * @returns {string} - Returns topic name to be created, throws error if failure occurs
 */
const participantTopicTemplate = (template, participantName, functionality, action) => {
  try {
    return Mustache.render(template, {
      participantName,
      functionality,
      action
    })
  } catch (e) {
    Logger.error(e)
    throw e
  }
}

/**
 * @function GeneralTopicTemplate
 *
 * @description Generates a general topic name from the 2 inputs, which are used in the placeholder general topic template found in the default.json
 *
 * @param {string} template - The template for that needs to be populated
 * @param {string} functionality - the functionality flow. Example: 'transfer'
 * @param {string} action - the action that applies to the flow. Example: 'prepare'
 *
 * @returns {string} - Returns topic name to be created, throws error if failure occurs
 */
const generalTopicTemplate = (template, functionality, action) => {
  try {
    return Mustache.render(template, { functionality, action })
  } catch (e) {
    Logger.error(e)
    throw e
  }
}

/**
 * @function TransformGeneralTopicName
 *
 * @description generalTopicTemplate called which generates a general topic name from the 2 inputs, which are used in the placeholder general topic template found in the default.json
 *
 * @param {string} template - The template for that needs to be populated
 * @param {string} functionality - the functionality flow. Example: 'transfer'
 * @param {string} action - the action that applies to the flow. Example: 'prepare'
 *
 * @returns {string} - Returns topic name to be created, throws error if failure occurs
 */
const transformGeneralTopicName = (template, functionality, action) => {
  try {
    if (Enum.Kafka.TopicMap[functionality] && Enum.Kafka.TopicMap[functionality][action]) {
      return generalTopicTemplate(template, Enum.Kafka.TopicMap[functionality][action].functionality, Enum.Kafka.TopicMap[functionality][action].action)
    }
    return generalTopicTemplate(template, functionality, action)
  } catch (err) {
    Logger.error(err)
    throw err
  }
}

/**
 * @function TransformGeneralTopicName
 *
 * @description participantTopicTemplate called which generates a participant topic name from the 3 inputs, which are used in the placeholder participant topic template found in the default.json
 *
 * @param {string} template - The template for that needs to be populated
 * @param {string} participantName - participant name, retrieved from database. Example: 'dfsp1'
 * @param {string} functionality - the functionality flow. Example: 'transfer'
 * @param {string} action - the action that applies to the flow. Example: 'prepare'
 *
 * @returns {string} - Returns topic name to be created, throws error if failure occurs
 */
const transformAccountToTopicName = (template, participantName, functionality, action) => {
  try {
    return participantTopicTemplate(template, participantName, functionality, action)
  } catch (err) {
    Logger.error(err)
    throw err
  }
}

/**
 * @function GetKafkaConfig
 *
 * @description participantTopicTemplate called which generates a participant topic name from the 3 inputs, which are used in the placeholder participant topic template found in the default.json
 *
 * @param {string} kafkaConfig - This is the Kafka config set in the default.json in you API
 * @param {string} flow - This is required for the config for the Stream Processing API. Example: 'CONSUMER' ie: note the case of text
 * @param {string} functionality - the functionality flow. Example: 'TRANSFER' ie: note the case of text
 * @param {string} action - the action that applies to the flow. Example: 'PREPARE' ie: note the case of text
 *
 * @returns {string} - Returns topic name to be created, throws error if failure occurs
 */
const getKafkaConfig = (kafkaConfig, flow, functionality, action) => {
  try {
    const flowObject = kafkaConfig[flow]
    const functionalityObject = flowObject[functionality]
    const actionObject = functionalityObject[action]
    actionObject.config.logger = Logger
    return actionObject.config
  } catch (e) {
    throw new Error(`No config found for flow='${flow}', functionality='${functionality}', action='${action}'`)
  }
}

/**
 * @function updateMessageProtocolMetadata
 *
 * @param {object} messageProtocol - The current messageProtocol from kafka
 * @param {string} metadataType - the type of flow. Example: 'notification'
 * @param {string} metadataAction - the action flow. Example: 'prepare'
 * @param {object} state - the state of the message being passed.
 * Example:
 * SUCCESS: {
 *   status: 'success',
 *   code: 0,
 *   description: 'action successful'
 * }
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
        state: state
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
 * @function createPrepareErrorStatus
 *
 * @param {number} errorCode - error code for error occurred
 * @param {string} errorDescription - error description for error occurred
 * @param {object} extensionList - list of extensions
 * Example:
 * errorInformation: {
 *   errorCode: '3001',
 *   errorDescription: 'A failure has occurred',
 *   extensionList: [{
 *      extension: {
 *        key: 'key',
 *        value: 'value'
 *      }
 *   }]
 * }
 *
 * @returns {object} - Returns errorInformation object
 */
const createPrepareErrorStatus = (errorCode, errorDescription, extensionList) => {
  errorCode = errorCode.toString()
  return {
    errorInformation: {
      errorCode,
      errorDescription,
      extensionList
    }
  }
}

/**
 * @function createState
 *
 * @param {string} status - status of message
 * @param {number} code - error code
 * @param {string} description - description of error
 * @example:
 * errorInformation: {
 *   status: 'error',
 *   code: 3100,
 *   description: 'error message'
 * }
 *
 * @returns {object} - Returns errorInformation object
 */
const createState = (status, code, description) => {
  return {
    status,
    code,
    description
  }
}

/**
 * @function createTransferMessageProtocol
 *
 * @param {object} payload - The payload of the api request
 * @param {string} type - the type flow. Example: 'prepare'
 * @param {string} action - the action flow. Example: 'commit'
 * @param {object} state - the state of the message being passed.
 * Example:
 * SUCCESS: {
 *   status: 'success',
 *   code: 0,
 *   description: 'action successful'
 * }
 * @param {string} pp - this is an optional field for future functionality to send the message to a third party
 *
 * @returns {object} - Returns newly created messageProtocol
 */
const createTransferMessageProtocol = (payload, type, action, state, pp = '') => {
  return {
    id: payload.transferId,
    from: payload.payerFsp,
    to: payload.payeeFsp,
    type: 'application/json',
    content: {
      header: {},
      payload
    },
    metadata: {
      event: {
        id: Uuid(),
        responseTo: '',
        type,
        action,
        createdAt: new Date(),
        state
      }
    },
    pp
  }
}

/**
 * @function createParticipantTopicConfig
 *
 * @param {string} template - The template for that needs to be populated
 * @param {string} participantName - The participant name
 * @param {string} functionality - the functionality flow. Example: 'transfer' ie: note the case of text
 * @param {string} action - the action that applies to the flow. Example: 'prepare' ie: note the case of text
 * @param {number} partition - optional partition to produce to
 * @param {*} opaqueKey - optional opaque token, which gets passed along to your delivery reports
 *
 * @returns {object} - Returns newly created participant topicConfig
 */
const createParticipantTopicConf = (template, participantName, functionality, action, key = null, partition = null, opaqueKey = null) => {
  return {
    topicName: transformAccountToTopicName(template, participantName, functionality, action),
    key,
    partition,
    opaqueKey
  }
}

/**
 * @function createGeneralTopicConfig
 *
 * @param {string} template - The template for that needs to be populated
 * @param {string} functionality - the functionality flow. Example: 'transfer' ie: note the case of text
 * @param {string} action - the action that applies to the flow. Example: 'prepare' ie: note the case of text
 * @param {string} key - optional key that allows partitioning it occur
 * @param {number} partition - optional partition to produce to
 * @param {*} opaqueKey - optional opaque token, which gets passed along to your delivery reports
 *
 * @returns {object} - Returns newly created general topicConfig
 */
const createGeneralTopicConf = (template, functionality, action, key = null, partition = null, opaqueKey = null) => {
  return {
    topicName: transformGeneralTopicName(template, functionality, action),
    key,
    partition,
    opaqueKey
  }
}

/**
 * @function produceGeneralMessage
 *
 * @async
 * @description This is an async method that produces a message against a generated Kafka topic. it is called multiple times
 *
 * Kafka.Producer.produceMessage called to persist the message to the configured topic on Kafka
 * Utility.updateMessageProtocolMetadata called updates the messages metadata
 * Utility.createGeneralTopicConf called dynamically generates the general topic configuration
 * Utility.getKafkaConfig called dynamically gets Kafka configuration
 *
 * @param {string} defaultKafkaConfig - This is the Kafka config set in the default.json in you API
 * @param {string} functionality - the functionality flow. Example: 'transfer' ie: note the case of text
 * @param {string} action - the action that applies to the flow. Example: 'prepare' ie: note the case of text
 * @param {object} message - a list of messages to consume for the relevant topic
 * @param {object} state - state of the message being produced
 * @param {string} key - optional key that allows partitioning it occur
 *
 * @returns {object} - Returns a boolean: true if successful, or throws and error if failed
 */
const produceGeneralMessage = async (defaultKafkaConfig, functionality, action, message, state, key) => {
  let functionalityMapped = functionality
  let actionMapped = action
  if (Enum.Kafka.TopicMap[functionality] && Enum.Kafka.TopicMap[functionality][action]) {
    functionalityMapped = Enum.Kafka.TopicMap[functionality][action].functionality
    actionMapped = Enum.Kafka.TopicMap[functionality][action].action
  }
  const messageProtocol = updateMessageProtocolMetadata(message, functionality, action, state)
  const topicConfig = createGeneralTopicConf(functionalityMapped, actionMapped, key)
  const kafkaConfig = getKafkaConfig(defaultKafkaConfig, Enum.Kafka.Config.PRODUCER, functionalityMapped.toUpperCase(), actionMapped.toUpperCase())
  await Kafka.Producer.produceMessage(messageProtocol, topicConfig, kafkaConfig)
  return true
}

/**
 * @function produceParticipantMessage
 *
 * @async
 *
 * @description This is an async method that produces a message against a Kafka generated topic for a specific participant. it is called multiple times
 *
 * Kafka.Producer.produceMessage called to persist the message to the configured topic on Kafka
 * Utility.updateMessageProtocolMetadata called updates the messages metadata
 * Utility.createParticipantTopicConf called dynamically generates the topic configuration with a participant name
 * Utility.getKafkaConfig called dynamically gets Kafka configuration
 *
 * @param {string} defaultKafkaConfig - This is the Kafka config set in the default.json in you API
 * @param {string} participantName - the name of the participant for topic creation
 * @param {string} functionality - the functionality flow. Example: 'transfer' ie: note the case of text
 * @param {string} action - the action that applies to the flow. Example: 'prepare' ie: note the case of text
 * @param {object} message - a list of messages to consume for the relevant topic
 * @param {object} state - state of the message being produced
 *
 * @returns {object} - Returns a boolean: true if successful, or throws and error if failed
 */
const produceParticipantMessage = async (defaultKafkaConfig, participantName, functionality, action, message, state) => {
  let functionalityMapped = functionality
  let actionMapped = action
  if (Enum.Kafka.TopicMap[functionality] && Enum.Kafka.TopicMap[functionality][action]) {
    functionalityMapped = Enum.Kafka.TopicMap[functionality][action].functionality
    actionMapped = Enum.Kafka.TopicMap[functionality][action].action
  }
  const messageProtocol = updateMessageProtocolMetadata(message, functionality, action, state)
  const topicConfig = createParticipantTopicConf(defaultKafkaConfig, participantName, functionalityMapped, actionMapped)
  const kafkaConfig = getKafkaConfig(defaultKafkaConfig, Enum.Kafka.Config.PRODUCER, functionalityMapped.toUpperCase(), actionMapped.toUpperCase())
  await Kafka.Producer.produceMessage(messageProtocol, topicConfig, kafkaConfig)
  return true
}

const commitMessageSync = async (kafkaTopic, consumer, message) => {
  if (!Kafka.Consumer.isConsumerAutoCommitEnabled(kafkaTopic)) {
    await consumer.commitMessageSync(message)
  }
}

const breadcrumb = (location, message) => {
  if (typeof message === 'object') {
    if (message.method) {
      location.method = message.method
      location.path = `${location.module}::${location.method}`
    }
    if (message.path) {
      location.path = `${location.module}::${location.method}::${message.path}`
    }
  } else if (typeof message === 'string') {
    location.path += `::${message}`
  }
  return location.path
}

module.exports = {
  transformAccountToTopicName,
  transformGeneralTopicName,
  getKafkaConfig,
  updateMessageProtocolMetadata,
  createPrepareErrorStatus,
  createState,
  createTransferMessageProtocol,
  createParticipantTopicConf,
  createGeneralTopicConf,
  produceParticipantMessage,
  produceGeneralMessage,
  commitMessageSync,
  breadcrumb
}
