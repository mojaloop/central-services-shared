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

 * Valentin Genev <valentin.genev@modusbox.com>

 --------------
 ******/
'use strict'
const Test = require('tapes')(require('tape'))
const parseResourceVersion = require('../../../src/util/helpers').__parseResourceVersions

Test('Http tests', helperTest => {

  helperTest.test('parseResourceVersions should parse setting correctl', parseResourveVersions => {

    parseResourveVersions.test('create resourceVersions object', (test) => {
      try {
        const resourceVersions = {
          resourceOneName: {
            acceptVersion: '1',
            contentVersion: '1.0'
          },
          resourceTwoName: {
            acceptVersion: '1',
            contentVersion: '1.1'
          }
        }

        const result = parseResourceVersion('resourceOneName=1.0,resourceTwoName=1.1')
        test.deepEquals(result, resourceVersions)
        test.end()
      } catch (e) {
        test.fail()
        test.end()
      }
    })

    parseResourveVersions.test('return empty resourceVersions object if empty string is passed', (test) => {
      try {
        const resourceVersions = {}

        const result = parseResourceVersion('')
        test.deepEquals(result, resourceVersions)
        test.end()
      } catch (e) {
        test.fail()
        test.end()
      }
    })

    parseResourveVersions.test('should throw if wrong format is passed', (test) => {
      try {
        parseResourceVersion('resourceOneName=1.0;resourceTwoName=1.1')
        test.fail('should throw')
        test.end()
      } catch (e) {
        test.pass()
        test.end()
      }
    })

    parseResourveVersions.end()
  })

  helperTest.end()
})
