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

 * Georgi Georgiev <georgi.georgiev@modusbox.com> : sourced from ml-api-adapter
 * Shashikant Hirugade <shashikant.hirugade@modusbox.com>
--------------
 ******/

'use strict'

const Mustache = require('mustache')
const Logger = require('../logger')
const Enum = require('../enums').Kafka

/**
 * @method getTopicFromTemplate
 *
 * @description Generates a topic name from a template
 *
 * @param {string} template - template string to render with optional view arguments.
 * @param {object} options - optional `view` argument key-value pairs to render the template against.
 *
 * @returns {string} - Returns topic name to be created, throws error if failure occurs
 */
const renderTopicFromTemplate = (template, options = {}) => {
  try {
    return Mustache.render(template, options)
  } catch (e) {
    Logger.error(e)
    throw new Error(`Unable render template due to the following error - ${e}`)
  }
}

/**
 * @function getGeneralTopic
 *
 * @description Generates a general topic name from the 2 inputs, which are used in the placeholder general topic template found in the default.json
 *
 * @param {string} functionality - the functionality flow. Example: 'transfer'
 * @param {string} action - the action that applies to the flow. Example: 'prepare'
 * @param {string} template - optional. template string to render with optional view arguments. Defaults to Enum.Kafka.Defaults.TOPIC_TEMPLATES.GENERAL_TOPIC_TEMPLATE.TEMPLATE.
 *
 * @returns {string} - Returns topic name to be created, throws error if failure occurs
 */
const getGeneralTopic = (functionality, action, template = Enum.Defaults.TOPIC_TEMPLATES.GENERAL_TOPIC_TEMPLATE.TEMPLATE) => {
  try {
    return renderTopicFromTemplate(template, { functionality, action })
  } catch (e) {
    Logger.error(e)
    throw e
  }
}

/**
 * @method GetKafkaConfig
 *
 * @param {string} flow - This is required for the config for the ML API ADAPTER. Example: 'CONSUMER' ie: note the case of text
 * @param {string} functionality - the functionality flow. Example: 'TRANSFER' ie: note the case of text
 * @param {string} action - the action that applies to the flow. Example: 'PREPARE' ie: note the case of text
 *
 * @returns {string} - Returns topic name to be created, throws error if failure occurs
 */
const getKafkaConfig = (config, flow, functionality, action) => {
  try {
    const flowObject = config.KAFKA_CONFIG[flow]
    const functionalityObject = flowObject[functionality]
    const actionObject = functionalityObject[action]
    actionObject.config.logger = Logger
    return actionObject.config
  } catch (e) {
    throw new Error(`No config found for flow='${flow}', functionality='${functionality}', action='${action}'`)
  }
}

/**
 * @function createGeneralTopicConf
 *
 * @param {string} participantName - The participant name
 * @param {string} functionality - the functionality flow. Example: 'transfer' ie: note the case of text
 * @param {string} action - the action that applies to the flow. Example: 'prepare' ie: note the case of text
 * @param {*} key - optional key to be sent on the message
 * @param {number} partition - optional partition to produce to
 * @param {*} opaqueKey - optional opaque token, which gets passed along to your delivery reports
 *
 * @returns {object} - Returns newly created general topicConfig
 */
const createGeneralTopicConf = (config, functionality, action, key = null, partition = null, opaqueKey = null) => {
  return {
    topicName: getGeneralTopic(config, functionality, action),
    key,
    partition,
    opaqueKey
  }
}

module.exports = {
  renderTopicFromTemplate,
  createGeneralTopicConf,
  getGeneralTopic,
  getKafkaConfig
}
