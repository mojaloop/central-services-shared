/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
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

 --------------
 ******/
'use strict'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Path = require('path')
const OpenapiBackend = require('../../../src/util').OpenapiBackend
const Handlers = require('../../util/handlers')

Test('OpenapiBackend tests', OpenapiBackendTest => {
  let sandbox

  OpenapiBackendTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    t.end()
  })

  OpenapiBackendTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  OpenapiBackendTest.test('initialize should', async (initializeTest) => {
    initializeTest.test('create a openapi backend object', async (test) => {
      const swagger = Path.resolve(__dirname, '../../resources/interface/swagger.yaml')
      const api = await OpenapiBackend.initialise(swagger, Handlers)
      test.ok(api, 'api object created')
      test.ok(api.definition, 'definition created')
      test.ok(api.definition.components.schemas.FirstName.regexp, 'regex object created')
      test.end()
    })

    initializeTest.end()
  })

  OpenapiBackendTest.test('initialize should', async (initializeTest) => {
    initializeTest.test('create a openapi backend object', async (test) => {
      const swagger = Path.resolve(__dirname, '../../resources/interface/swagger.yaml')
      const api = await OpenapiBackend.initialise(swagger, Handlers, { $data: true })
      test.ok(api, 'api object created')
      test.ok(api.definition, 'definition created')
      test.ok(api.definition.components.schemas.FirstName.regexp, 'regex object created')
      test.end()
    })

    initializeTest.end()
  })

  OpenapiBackendTest.test('validationFail should', async (validationFailTest) => {
    validationFailTest.test('throw a FSPIOP error', async (test) => {
      const context = {
        validation: {
          errors: [{
            keyword: 'additionalProperties',
            dataPath: '.requestBody.payee.partyIdInfo',
            schemaPath: '#/properties/requestBody/properties/payee/properties/partyIdInfo/additionalProperties',
            params: {
              additionalProperty: 'fake'
            },
            message: 'should NOT have additional properties'
          }]
        }
      }
      try {
        await OpenapiBackend.validationFail(context)
      } catch (e) {
        test.equal(e.httpStatusCode, 400, 'statusCode 400 thrown')
        test.equal(e.toApiErrorObject().errorInformation.errorCode, '3103', 'errorCode returned 3103')
        test.end()
      }
    })

    validationFailTest.end()
  })

  OpenapiBackendTest.end()
})
