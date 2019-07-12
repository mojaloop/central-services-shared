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
 * Rajiv Mothilal <rajiv.mothilal@modusbox.com>
 * Miguel de Barros <miguel.debarros@modusbox.com>
 --------------
 ******/

'use strict'

const Test = require('tape')
const Util = require('../../src/util').Kafka
const Enum = require('../../src/enums').Kafka

Test('Kafka util', kafkaUtilTest => {
  kafkaUtilTest.test('renderTopicFromTemplate should', renderTopicFromTemplateTest => {
    renderTopicFromTemplateTest.test('render template with default template & test options', test => {
      const options = {
        functionality: 'functionality',
        action: 'action'
      }
      const value = Util.renderTopicFromTemplate(Enum.Defaults.TOPIC_TEMPLATES.GENERAL_TOPIC_TEMPLATE.TEMPLATE, options)
      test.equal(value, `topic-${options.functionality}-${options.action}`)
      test.end()
    })

    renderTopicFromTemplateTest.test('render template with default template & empty options', test => {
      const options = {}
      const value = Util.renderTopicFromTemplate(Enum.Defaults.TOPIC_TEMPLATES.GENERAL_TOPIC_TEMPLATE.TEMPLATE, options)
      test.equal(value, `topic--`)
      test.end()
    })

    renderTopicFromTemplateTest.test('render template with default template & null options', test => {
      const options = null
      let value
      try {
        value = Util.renderTopicFromTemplate(Enum.Defaults.TOPIC_TEMPLATES.GENERAL_TOPIC_TEMPLATE.TEMPLATE, options)
        test.fail('Expected error to be thrown')
      } catch (e) {
        test.pass(`Error thrown for ${value} - ${e}`)
      }
      test.end()
    })

    renderTopicFromTemplateTest.end()
  })

  kafkaUtilTest.test('getGeneralTopic should', getGeneralTopicTest => {
    getGeneralTopicTest.test('render template with set default template & test options', test => {
      const options = {
        functionality: 'functionality',
        action: 'action'
      }
      const value = Util.getGeneralTopic(options.functionality, options.action, Enum.Defaults.TOPIC_TEMPLATES.GENERAL_TOPIC_TEMPLATE.TEMPLATE)
      test.equal(value, `topic-${options.functionality}-${options.action}`)
      test.end()
    })

    getGeneralTopicTest.test('render template with default template & test options', test => {
      const options = {
        functionality: 'functionality',
        action: 'action'
      }
      const value = Util.getGeneralTopic(options.functionality, options.action)
      test.equal(value, `topic-${options.functionality}-${options.action}`)
      test.end()
    })

    getGeneralTopicTest.test('render template with default template & null options', test => {
      let value
      try {
        const value = Util.getGeneralTopic(null, null)
        test.equal(value, `topic--`)
      } catch (e) {
        test.fail(`Unexpected error to be thrown - ${e}`)
      }
      test.end()
    })
    getGeneralTopicTest.end()
  })
  kafkaUtilTest.end()
})
