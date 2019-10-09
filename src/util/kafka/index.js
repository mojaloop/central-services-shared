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

 * Rajiv Mothilal <rajiv.mothilal@modusbox.com>
 * Miguel de Barros <miguel.debarros@modusbox.com>

 --------------
 ******/
'use strict'

/**
 * @module src/handlers/lib/kafka
 */
const Mustache = require('mustache')
const Logger = require('@mojaloop/central-services-logger')
const Enum = require('../../enums')
const StreamingProtocol = require('../streaming/protocol')
const ErrorHandler = require('@mojaloop/central-services-error-handling')
const EventSdk = require('@mojaloop/event-sdk')

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
  } catch (err) {
    Logger.error(err)
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
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
  } catch (err) {
    Logger.error(err)
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
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
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
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
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
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
    const actionObject = action ? functionalityObject[action] : functionalityObject
    actionObject.config.logger = Logger
    return actionObject.config
  } catch (err) {
    throw ErrorHandler.Factory.createInternalServerFSPIOPError(`No config found for flow='${flow}', functionality='${functionality}', action='${action}'`, err)
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

const getFunctionalityAction = (functionality, action) => {
  let functionalityMapped = functionality
  let actionMapped = action
  if (Enum.Kafka.TopicMap[functionality] && Enum.Kafka.TopicMap[functionality][action]) {
    functionalityMapped = Enum.Kafka.TopicMap[functionality][action].functionality
    actionMapped = Enum.Kafka.TopicMap[functionality][action].action
  }
  return { functionalityMapped, actionMapped }
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
 * @param {Producer} kafkaProducer - This is the Kafka Producer
 * @param {string} functionality - the functionality flow. Example: 'transfer' ie: note the case of text
 * @param {string} action - the action that applies to the flow. Example: 'prepare' ie: note the case of text
 * @param {object} message - a list of messages to consume for the relevant topic
 * @param {object} state - state of the message being produced
 * @param {string} key - optional key that allows partitioning it occur
 * @param {object} span - the span for event logging
 *
 * @returns {object} - Returns a boolean: true if successful, or throws and error if failed
 */
const produceGeneralMessage = async (defaultKafkaConfig, kafkaProducer, functionality, action, message, state, key = null, span = null) => {
  const { functionalityMapped, actionMapped } = getFunctionalityAction(functionality, action)
  let messageProtocol = StreamingProtocol.updateMessageProtocolMetadata(message, functionality, action, state)
  const topicConfig = createGeneralTopicConf(defaultKafkaConfig.TOPIC_TEMPLATES.GENERAL_TOPIC_TEMPLATE.TEMPLATE, functionalityMapped, actionMapped, key)
  const kafkaConfig = getKafkaConfig(defaultKafkaConfig, Enum.Kafka.Config.PRODUCER, functionalityMapped.toUpperCase(), actionMapped.toUpperCase())
  if (span) {
    messageProtocol = await span.injectContextToMessage(messageProtocol)
    span.audit(messageProtocol, EventSdk.AuditEventAction.egress)
  }
  await kafkaProducer.produceMessage(messageProtocol, topicConfig, kafkaConfig)
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
 * @param {Producer} kafkaProducer - This is the Kafka Producer
 * @param {string} participantName - the name of the participant for topic creation
 * @param {string} functionality - the functionality flow. Example: 'transfer' ie: note the case of text
 * @param {string} action - the action that applies to the flow. Example: 'prepare' ie: note the case of text
 * @param {object} message - a list of messages to consume for the relevant topic
 * @param {object} state - state of the message being produced
 *
 * @returns {object} - Returns a boolean: true if successful, or throws and error if failed
 */
const produceParticipantMessage = async (defaultKafkaConfig, kafkaProducer, participantName, functionality, action, message, state) => {
  const { functionalityMapped, actionMapped } = getFunctionalityAction(functionality, action)
  const messageProtocol = StreamingProtocol.updateMessageProtocolMetadata(message, functionality, action, state)
  const topicConfig = createParticipantTopicConf(defaultKafkaConfig.TOPIC_TEMPLATES.PARTICIPANT_TOPIC_TEMPLATE.TEMPLATE, participantName, functionalityMapped, actionMapped)
  const kafkaConfig = getKafkaConfig(defaultKafkaConfig, Enum.Kafka.Config.PRODUCER, functionalityMapped.toUpperCase(), actionMapped.toUpperCase())
  await kafkaProducer.produceMessage(messageProtocol, topicConfig, kafkaConfig)
  return true
}

const commitMessageSync = async (kafkaConsumer, kafkaTopic, message) => {
  if (!kafkaConsumer.isConsumerAutoCommitEnabled(kafkaTopic)) {
    try {
      const consumer = kafkaConsumer.getConsumer(kafkaTopic)
      await consumer.commitMessageSync(message)
    } catch (err) {
      Logger.info(`No consumer found for topic ${kafkaTopic}`)
      Logger.error(err)
      throw err
    }
  }
}

const proceed = async (defaultKafkaConfig, params, opts) => {
  const { message, kafkaTopic, consumer, decodedPayload, span, producer } = params
  const { consumerCommit, fspiopError, eventDetail, fromSwitch, toDestination } = opts
  let metadataState

  if (consumerCommit) {
    await commitMessageSync(consumer, kafkaTopic, message)
  }
  if (fspiopError) {
    if (!message.value.content.uriParams || !message.value.content.uriParams.id) {
      message.value.content.uriParams = { id: decodedPayload.transferId }
    }
    message.value.content.payload = fspiopError
    metadataState = StreamingProtocol.createEventState(Enum.Events.EventStatus.FAILURE.status, fspiopError.errorInformation.errorCode, fspiopError.errorInformation.errorDescription)
  } else {
    metadataState = Enum.Events.EventStatus.SUCCESS
  }
  if (fromSwitch) {
    message.value.to = message.value.from
    message.value.from = Enum.Http.Headers.FSPIOP.SWITCH.value
    message.value.content.headers[Enum.Http.Headers.FSPIOP.DESTINATION] = message.value.to
  }
  let key
  if (typeof toDestination === 'string') {
    message.value.to = toDestination
    message.value.content.headers[Enum.Http.Headers.FSPIOP.DESTINATION] = toDestination
  } else if (toDestination === true) {
    key = message.value.content.headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  }
  if (eventDetail && producer) {
    await produceGeneralMessage(defaultKafkaConfig, producer, eventDetail.functionality, eventDetail.action, message.value, metadataState, key, span)
  }
  return true
}

module.exports = {
  transformAccountToTopicName,
  transformGeneralTopicName,
  getKafkaConfig,
  createParticipantTopicConf,
  createGeneralTopicConf,
  produceParticipantMessage,
  produceGeneralMessage,
  commitMessageSync,
  proceed
}
