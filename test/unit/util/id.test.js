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

 * Infitx
 - Kalin Krustev <kalin.krustev@infitx.com>
 --------------
 ******/
'use strict'

const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const idGenerator = require('../../../src/util/id')
const uuidRegex = version => new RegExp(`[a-f0-9]{8}-[a-f0-9]{4}-${version}[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}`)

Test('Id util', idTest => {
  let sandbox

  idTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    t.end()
  })

  idTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  idTest.test('Id should', generateSha256Test => {
    generateSha256Test.test('generate UUID v4', test => {
      const uuid4 = idGenerator({ type: 'uuid', version: 4 })
      test.match(uuid4(), uuidRegex(4))
      test.end()
    })
    generateSha256Test.test('generate UUID v7', test => {
      const uuid7 = idGenerator({ type: 'uuid', version: 7 })
      test.match(uuid7(), uuidRegex(7))
      test.end()
    })
    generateSha256Test.test('generate UUID v7 by default', test => {
      const uuid = idGenerator()
      test.match(uuid(), uuidRegex(7))
      test.end()
    })
    generateSha256Test.end()
  })

  idTest.end()
})
