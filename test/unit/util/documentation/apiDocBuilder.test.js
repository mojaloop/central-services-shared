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

 * Steven Oderayi <steven.oderayi@modusbox.com>

 --------------
 ******/
'use strict'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Path = require('path')
const fs = require('fs')
const YAML = require('yaml')
const APIDocBuilder = require('../../../../src/util/documentation').APIDocBuilder

const TestAPISwaggerPath = Path.resolve(__dirname, '../../../resources/interface/swagger.yaml')

Test('APIDocBuilder tests', APIDocBuilderTest => {
  let sandbox

  APIDocBuilderTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    t.end()
  })

  APIDocBuilderTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  APIDocBuilderTest.test('generateDocumentation should', async (generateDocumentationTest) => {
    generateDocumentationTest.test('throw if both option.documentPath and options.document are absent', async (test) => {
      const options = {}
      try {
        await APIDocBuilder.generateDocumentation(options)
        test.notok('Error should be thrown')
      } catch (err) {
        test.ok('error thrown')
      }

      test.end()
    })

    generateDocumentationTest.test('generate documentation based on option.documentPath', async (test) => {
      const options = { documentPath: TestAPISwaggerPath }
      const apiDoc = await APIDocBuilder.generateDocumentation(options)
      test.ok(apiDoc, 'api documentation generated')
      test.ok(apiDoc.indexOf('<html ') >= 0, 'documentation format is HTML')
      test.ok(apiDoc.indexOf('Transaction Requests') >= 0, 'documentation content valid')
      test.end()
    })

    generateDocumentationTest.test('generate documentation based on option.document', async (test) => {
      const options = { document: YAML.parse(fs.readFileSync(TestAPISwaggerPath, 'utf8')) }
      const apiDoc = await APIDocBuilder.generateDocumentation(options)
      test.ok(apiDoc, 'api documentation generated')
      test.ok(apiDoc.indexOf('<html ') >= 0, 'documentation format is HTML')
      test.ok(apiDoc.indexOf('Transaction Requests') >= 0, 'documentation content valid')
      test.end()
    })

    generateDocumentationTest.test('generate documentation with overriden widdershinsOptions', async (test) => {
      const options = { documentPath: TestAPISwaggerPath, widdershinsOptions: { language_tabs: [] } }
      const apiDoc = await APIDocBuilder.generateDocumentation(options)
      test.ok(apiDoc, 'api documentation generated')
      test.ok(apiDoc.indexOf('Python') < 0, 'documentation content valid')
      test.end()
    })

    generateDocumentationTest.test('generate documentation with overriden shinsOptions', async (test) => {
      const options = { documentPath: TestAPISwaggerPath, shinsOptions: { minify: false } }
      const apiDoc = await APIDocBuilder.generateDocumentation(options)
      test.ok(apiDoc, 'api documentation generated')
      test.ok(apiDoc.indexOf('<html ') >= 0, 'documentation format is HTML')
      test.ok(apiDoc.indexOf('Transaction Requests') >= 0, 'documentation content valid')
      test.end()
    })

    generateDocumentationTest.end()
  })

  APIDocBuilderTest.test('swaggerJSON should', async (swaggerJSONTest) => {
    swaggerJSONTest.test('throw if both option.documentPath and options.document are absent', async (test) => {
      const options = {}
      try {
        await APIDocBuilder.swaggerJSON(options)
        test.notok('Error should be thrown')
      } catch (err) {
        test.ok('error thrown')
      }

      test.end()
    })

    swaggerJSONTest.test('return swagger in JSON format based on option.documentPath', async (test) => {
      const options = { documentPath: TestAPISwaggerPath }
      const jsonStr = await APIDocBuilder.swaggerJSON(options)
      test.ok(jsonStr, 'swagger JSON string returned')
      test.ok(JSON.parse(jsonStr), 'documentation format is JSON')
      test.ok(jsonStr.indexOf('Transaction Requests') >= 0, 'JSON content is valid')
      test.end()
    })

    swaggerJSONTest.test('return swagger in JSON format based on option.document', async (test) => {
      const options = { document: YAML.parse(fs.readFileSync(TestAPISwaggerPath, 'utf8')) }
      const jsonStr = await APIDocBuilder.swaggerJSON(options)
      test.ok(jsonStr, 'swagger JSON string returned')
      test.ok(JSON.parse(jsonStr), 'documentation format is JSON')
      test.ok(jsonStr.indexOf('Transaction Requests') >= 0, 'JSON content is valid')
      test.end()
    })

    swaggerJSONTest.end()
  })

  APIDocBuilderTest.end()
})
