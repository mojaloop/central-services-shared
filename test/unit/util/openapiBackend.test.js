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
      test.ok(api.definition.components.schemas.FirstName.pattern, 'regex object created')
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
      test.ok(api.definition.components.schemas.FirstName.pattern, 'regex object created')
      test.end()
    })

    initializeTest.end()
  })

  OpenapiBackendTest.test('initialise should coerce request parameter types', async (coerceTest) => {
    // hapi-openapi coerced request parameters to the types declared in the API definition
    // before calling the handler. openapi-backend only does this when its top-level
    // `coerceTypes` option is set: `ajvOpts.coerceTypes` alone lets validation *accept*
    // "123" for an integer, but the handler would still receive the raw string.
    // Note: openapi-backend (5.21) re-parses path parameters from the URL after validation,
    // so only query parameters arrive coerced on `context.request`; the coerced path
    // parameters are exposed on `context.validation.coerced.params`.
    const definition = Path.resolve(__dirname, '../../resources/interface/coercion.yaml')

    coerceTest.test('pass coerced query parameters to the operation handler', async (test) => {
      let received
      const api = await OpenapiBackend.initialise(definition, {
        getItem: async (context) => {
          received = context
          return 'ok'
        },
        validationFail: OpenapiBackend.validationFail,
        notFound: OpenapiBackend.notFound
      })

      const result = await api.handleRequest({
        method: 'GET',
        path: '/items/42',
        query: { limit: '10', ratio: '0.5', verbose: 'true' },
        headers: {}
      })

      test.equal(result, 'ok', 'handler was invoked')
      test.strictEqual(received.request.query.limit, 10, 'integer query parameter coerced')
      test.strictEqual(received.request.query.ratio, 0.5, 'number query parameter coerced')
      test.strictEqual(received.request.query.verbose, true, 'boolean query parameter coerced')
      test.strictEqual(received.validation.coerced.params.id, 42, 'path parameter coerced during validation')
      test.strictEqual(received.validation.coerced.query.limit, 10, 'coerced query available on the validation result')
      test.end()
    })

    coerceTest.test('still reject values that cannot be coerced to the declared type', async (test) => {
      const api = await OpenapiBackend.initialise(definition, {
        getItem: async () => test.fail('handler must not run for an invalid request'),
        validationFail: OpenapiBackend.validationFail,
        notFound: OpenapiBackend.notFound
      })

      try {
        await api.handleRequest({
          method: 'GET',
          path: '/items/not-a-number',
          query: {},
          headers: {}
        })
        test.fail('Expected validation to fail')
      } catch (err) {
        test.equal(err.httpStatusCode, 400, 'statusCode 400 thrown')
        test.equal(err.toApiErrorObject().errorInformation.errorCode, '3101', 'errorCode returned 3101 (malformed syntax)')
      }
      test.end()
    })

    coerceTest.test('coerce parameters when custom ajv options are supplied', async (test) => {
      let received
      const api = await OpenapiBackend.initialise(definition, {
        getItem: async (context) => {
          received = context
          return 'ok'
        },
        validationFail: OpenapiBackend.validationFail,
        notFound: OpenapiBackend.notFound
      }, { $data: true })

      await api.handleRequest({
        method: 'GET',
        path: '/items/7',
        query: { limit: '3' },
        headers: {}
      })

      test.strictEqual(received.request.query.limit, 3, 'query parameter coerced with custom ajv options')
      test.strictEqual(received.validation.coerced.params.id, 7, 'path parameter coerced with custom ajv options')
      test.end()
    })

    coerceTest.end()
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

    validationFailTest.test('select a specific validation error over a generic anyOf branch error', async (test) => {
      const context = {
        validation: {
          errors: [
            {
              instancePath: '/requestBody/CdtTrfTxInf/Dbtr/Id',
              keyword: 'required',
              params: { missingProperty: 'OrgId' },
              message: "must have required property 'OrgId'"
            },
            {
              instancePath: '/requestBody/CdtTrfTxInf/Dbtr/Id/PrvtId/DtAndPlcOfBirth/CtryOfBirth',
              keyword: 'pattern',
              params: { pattern: '^[A-Z]{2,2}$' },
              message: 'must match pattern "^[A-Z]{2,2}$"'
            },
            {
              instancePath: '/requestBody/CdtTrfTxInf/Dbtr/Id',
              keyword: 'anyOf',
              params: {},
              message: 'must match a schema in anyOf'
            }
          ]
        }
      }

      try {
        await OpenapiBackend.validationFail(context)
        test.fail('Expected validationFail to throw')
      } catch (err) {
        test.equal(err.apiErrorCode.code, '3100', 'errorCode returned 3100')
        test.match(err.message, /CtryOfBirth/, 'error message contains specific field')
        test.notOk(err.message.includes('OrgId'), 'error message does not contain misleading branch error')
      }

      test.end()
    })

    validationFailTest.test('preserve original behaviour when no specific validation error is present', async (test) => {
      const context = {
        validation: {
          errors: [
            {
              instancePath: '/requestBody/CdtTrfTxInf/Dbtr/Id',
              keyword: 'required',
              params: { missingProperty: 'OrgId' },
              message: "must have required property 'OrgId'"
            },
            {
              instancePath: '/requestBody/CdtTrfTxInf/Dbtr/Id',
              keyword: 'anyOf',
              params: {},
              message: 'must match a schema in anyOf'
            }
          ]
        }
      }

      try {
        await OpenapiBackend.validationFail(context)
        test.fail('Expected validationFail to throw')
      } catch (err) {
        test.equal(err.apiErrorCode.code, '3102', 'errorCode returned 3102')
        test.match(err.message, /OrgId/, 'error message contains first validation error')
        test.notOk(err.message.includes('anyOf'), 'error message does not use generic anyOf error')
      }

      test.end()
    })

    validationFailTest.end()
  })

  OpenapiBackendTest.end()
})
