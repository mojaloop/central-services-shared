/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>

 * Rajiv Mothilal <rajiv.mothilal@modusbox.com>

 --------------
 ******/
'use strict'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Http = require('../../../src/util').Http

Test('Http tests', HttpTest => {
  let sandbox

  HttpTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    t.end()
  })

  HttpTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  HttpTest.test('createMetadataWithCorrelatedEventState should', switchDefaultHeadersTest => {
    switchDefaultHeadersTest.test('create a metadata object', (test) => {
      const resource = 'participants'
      const header = {
        accept: `application/vnd.interoperability.${resource}+json;version=1.0`,
        'FSPIOP-Destination': 'fsp2',
        'Content-Type': `application/vnd.interoperability.${resource}+json;version=1.0`,
        'FSPIOP-Source': 'fsp1'
      }
      const headersResponse = Http.SwitchDefaultHeaders(header['FSPIOP-Destination'], resource, header['FSPIOP-Source'])
      test.equal(headersResponse.accept, header.accept)
      test.equal(headersResponse['FSPIOP-Destination'], header['FSPIOP-Destination'])
      test.equal(headersResponse['FSPIOP-Source'], header['FSPIOP-Source'])
      test.end()
    })

    switchDefaultHeadersTest.end()
  })

  HttpTest.test('createMetadataWithCorrelatedEventState should', switchDefaultHeadersTest => {
    switchDefaultHeadersTest.test('create a metadata object', (test) => {
      const resource = 'participants'
      const header = {
        accept: `application/vnd.interoperability.${resource}+json;version=1.0`,
        'FSPIOP-Destination': 'fsp2',
        'Content-Type': `application/vnd.interoperability.${resource}+json;version=1.0`,
        'FSPIOP-Source': 'fsp1'
      }
      const headersResponse = Http.SwitchDefaultHeaders(undefined, resource, header['FSPIOP-Source'])
      test.equal(headersResponse.accept, header.accept)
      test.equal(headersResponse['FSPIOP-Destination'], '')
      test.equal(headersResponse['FSPIOP-Source'], header['FSPIOP-Source'])
      test.end()
    })

    switchDefaultHeadersTest.end()
  })

  HttpTest.end()
})
