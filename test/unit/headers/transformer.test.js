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
 * Miguel de Barros <miguel.debarros@modusbox.com>

 --------------
 ******/
'use strict'

const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')

const Transformer = require('../../../src/util').Headers
const Enum = require('../../../src/enums')
const Util = require('../../../src/util')
const Helper = require('../../util/helper')

const headerConfigExample = {
  httpMethod: 'PUT',
  sourceFsp: 'switch',
  destinationFsp: 'FSPDest',
  hubNameRegex: /^Hub$/i
}

const headerDataInputExample = {
  'Content-Type': 'application/vnd.interoperability.transfers+json;version=1.0',
  'Content-Length': '1234',
  'FSPIOP-Source': headerConfigExample.sourceFsp,
  'FSPIOP-Destination': headerConfigExample.destinationFsp,
  'FSPIOP-Http-Method': 'PUT',
  'FSPIOP-Signature': '{"signature":"iU4GBXSfY8twZMj1zXX1CTe3LDO8Zvgui53icrriBxCUF_wltQmnjgWLWI4ZUEueVeOeTbDPBZazpBWYvBYpl5WJSUoXi14nVlangcsmu2vYkQUPmHtjOW-yb2ng6_aPfwd7oHLWrWzcsjTF-S4dW7GZRPHEbY_qCOhEwmmMOnE1FWF1OLvP0dM0r4y7FlnrZNhmuVIFhk_pMbEC44rtQmMFv4pm4EVGqmIm3eyXz0GkX8q_O1kGBoyIeV_P6RRcZ0nL6YUVMhPFSLJo6CIhL2zPm54Qdl2nVzDFWn_shVyV0Cl5vpcMJxJ--O_Zcbmpv6lxqDdygTC782Ob3CNMvg\\",\\"protectedHeader\\":\\"eyJhbGciOiJSUzI1NiIsIkZTUElPUC1VUkkiOiIvdHJhbnNmZXJzIiwiRlNQSU9QLUhUVFAtTWV0aG9kIjoiUE9TVCIsIkZTUElPUC1Tb3VyY2UiOiJPTUwiLCJGU1BJT1AtRGVzdGluYXRpb24iOiJNVE5Nb2JpbGVNb25leSIsIkRhdGUiOiIifQ"}',
  'FSPIOP-Uri': '/transfers'
}

const headerDataTransformedExample = {
  'Content-Type': headerDataInputExample['Content-Type'],
  'FSPIOP-Source': headerDataInputExample['FSPIOP-Source'],
  'FSPIOP-Destination': headerDataInputExample['FSPIOP-Destination']
}

Test('Transfer Transformer tests', TransformerTest => {
  let sandbox

  TransformerTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    t.end()
  })

  TransformerTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  TransformerTest.test('Transformer.getResourceInfoFromHeaderTest() should', getResourceInfoFromHeaderTest => {
    getResourceInfoFromHeaderTest.test('parse FSPIOP Content-Type example correctly', async test => {
      const result = Transformer.getResourceInfoFromHeader(headerDataInputExample['Content-Type'])
      test.equal(headerDataInputExample['Content-Type'], Helper.generateProtocolHeader(result.resourceType, result.version))
      test.end()
    })

    getResourceInfoFromHeaderTest.test('return an empty result with standard application/json', async test => {
      const contentType = 'application/json'
      const result = Transformer.getResourceInfoFromHeader(contentType)
      test.same(result, {})
      test.end()
    })

    getResourceInfoFromHeaderTest.test('return an empty result with incorrect FSPIOP Content-Type input', async test => {
      const contentType = 'application/vnd.interoperability.transfers+json'
      const result = Transformer.getResourceInfoFromHeader(contentType)
      test.same(result, {})
      test.end()
    })

    getResourceInfoFromHeaderTest.end()
  })

  TransformerTest.test('Transformer.transformHeaders() should', transformHeadersTest => {
    transformHeadersTest.test('Remove all unnecessary fields from Header', async test => {
      const headerData = Util.clone(headerDataInputExample)
      const transformedHeaderData = Transformer.transformHeaders(headerData, headerConfigExample)
      for (const headerKey in headerDataTransformedExample) {
        test.equals(transformedHeaderData[headerKey], headerDataTransformedExample[headerKey])
      }
      test.equals(transformedHeaderData[Enum.Http.Headers.GENERAL.CONTENT_LENGTH], undefined)
      test.end()
    })

    transformHeadersTest.test('Set ContentType && Accept versions via RESOURCE_VERSIONS env variable', async test => {
      const RESOURCE_VERSIONS_BACKUP = process.env.RESOURCE_VERSIONS
      process.env.RESOURCE_VERSIONS = 'transfers=1.1,quotes=1.0'

      const headerConfig = {
        httpMethod: 'PUT',
        sourceFsp: 'switch',
        destinationFsp: 'FSPDest',
        hubNameRegex: /^Hub$/i
      }

      const headerData = Util.clone(headerDataInputExample)
      headerData.Accept = Helper.generateProtocolHeader('transfers', '1')

      const transformedHeaderData = Transformer.transformHeaders(headerData, headerConfig)

      test.deepEqual(headerData['Content-Type'], transformedHeaderData['Content-Type'])
      test.deepEqual(headerData.Accept, transformedHeaderData.Accept)
      test.end()
      process.env.RESOURCE_VERSIONS = RESOURCE_VERSIONS_BACKUP
    })

    transformHeadersTest.test('Set ContentType && Accept versions via config', async test => {
      const RESOURCE_VERSIONS_BACKUP = process.env.RESOURCE_VERSIONS
      // we keep this here to make sure it does not override the injected protocolVersions config
      process.env.RESOURCE_VERSIONS = 'transfers=1.0,quotes=1.0'

      const headerConfig = {
        httpMethod: 'PUT',
        sourceFsp: 'Hub',
        destinationFsp: 'FSPDest',
        protocolVersions: {
          content: '1.1',
          accept: '1'
        },
        hubNameRegex: /^Hub$/i
      }

      const headerData = Util.clone(headerDataInputExample)
      headerData.Accept = Helper.generateProtocolHeader('transfers', '1.1')

      const resourceInfoFromHeader = Transformer.getResourceInfoFromHeader(headerData['Content-Type'])

      const transformedHeaderData = Transformer.transformHeaders(headerData, headerConfig)
      const resourceInfoFromTransformedHeader = Transformer.getResourceInfoFromHeader(transformedHeaderData['Content-Type'])

      test.equal(resourceInfoFromHeader.resourceType, resourceInfoFromTransformedHeader.resourceType)
      test.equal(resourceInfoFromHeader.version, '1.0')
      test.equal(resourceInfoFromTransformedHeader.version, '1.1')
      test.equal(transformedHeaderData.Accept, Helper.generateProtocolHeader('transfers', headerConfig.protocolVersions.accept))
      test.end()
      process.env.RESOURCE_VERSIONS = RESOURCE_VERSIONS_BACKUP
    })

    transformHeadersTest.test('Translate Date field into correct format for String value', async test => {
      const key = 'Date'
      const val = '2018-09-13T13:52:15.221Z'
      const date = new Date(val)
      const headerData = Util.clone(headerDataInputExample)
      headerData[key] = val
      // headerData

      const transformedHeaderData = Transformer.transformHeaders(headerData, headerConfigExample)

      for (const headerKey in headerDataTransformedExample) {
        test.equals(transformedHeaderData[headerKey], headerDataTransformedExample[headerKey])
      }
      test.equals(transformedHeaderData[key], date.toUTCString())
      test.end()
    })

    transformHeadersTest.test('Translate Date field into correct format for String value', async test => {
      const key = 'Date'
      const date = '2018-09-13T13:52:15.221Z'
      const val = new Date(date)
      const headerData = Util.clone(headerDataInputExample)
      headerData[key] = val

      const transformedHeaderData = Transformer.transformHeaders(headerData, headerConfigExample)

      for (const headerKey in headerDataTransformedExample) {
        test.equals(transformedHeaderData[headerKey], headerDataTransformedExample[headerKey])
      }
      test.equals(transformedHeaderData[key], val.toUTCString())
      test.end()
    })

    transformHeadersTest.test('Translate Date field for badly formatted string', async test => {
      const key = 'Date'
      const val = '2018-0'
      const headerData = Util.clone(headerDataInputExample)
      headerData[key] = val

      const transformedHeaderData = Transformer.transformHeaders(headerData, headerConfigExample)

      for (const headerKey in headerDataTransformedExample) {
        test.equals(transformedHeaderData[headerKey], headerDataTransformedExample[headerKey])
      }
      test.equals(transformedHeaderData[key], val)
      test.end()
    })

    transformHeadersTest.test('Transform the FSPIOP-HTTP-METHOD to match the HTTP operation if header is provided and does not match incoming value', async test => {
      const headerData = Util.clone(headerDataInputExample)
      const headerConfig = Util.clone(headerConfigExample)
      headerConfig[Enum.Http.Headers.FSPIOP.HTTP_METHOD] = 'GET'

      const transformedHeaderData = Transformer.transformHeaders(headerData, headerConfig)

      for (const headerKey in headerDataTransformedExample) {
        test.equals(transformedHeaderData[headerKey], headerDataTransformedExample[headerKey])
      }
      test.end()
    })

    transformHeadersTest.test('Transform to include the incoming signature when FSPIOP-Source does not match the switch regex', async test => {
      const headerData = Util.clone(headerDataInputExample)
      const headerConfig = Util.clone(headerConfigExample)
      headerData[Enum.Http.Headers.FSPIOP.SOURCE] = 'randomFSP'

      const transformedHeaderData = Transformer.transformHeaders(headerData, headerConfig)
      for (const headerKey in headerDataTransformedExample) {
        test.equals(transformedHeaderData[headerKey], headerDataTransformedExample[headerKey])
      }
      test.equals(transformedHeaderData[Enum.Http.Headers.FSPIOP.SIGNATURE], headerDataInputExample[Enum.Http.Headers.FSPIOP.SIGNATURE])
      test.end()
    })

    transformHeadersTest.test('Transform to include the incoming signature when FSPIOP-Source does not match the switch regex with INVALID http method', async test => {
      const headerData = Util.clone(headerDataInputExample)
      const headerConfig = Util.clone(headerConfigExample)
      headerConfig.httpMethod = 'INVALID'
      headerData[Enum.Http.Headers.FSPIOP.SOURCE] = 'randomFSP'

      const transformedHeaderData = Transformer.transformHeaders(headerData, headerConfig)
      for (const headerKey in headerDataTransformedExample) {
        test.equals(transformedHeaderData[headerKey], headerDataTransformedExample[headerKey])
      }
      test.equals(transformedHeaderData[Enum.Http.Headers.FSPIOP.SIGNATURE], headerDataInputExample[Enum.Http.Headers.FSPIOP.SIGNATURE])
      test.end()
    })

    transformHeadersTest.test('Transform to include map the destinationFsp even if the FSPIOP-Destination header was not included in the original request', async test => {
      const headerData = Util.clone(headerDataInputExample)

      // remove FSPIOP-Destination from the request
      Util.deleteFieldByCaseInsensitiveKey(headerData, Enum.Http.Headers.FSPIOP.DESTINATION)

      const headerConfig = Util.clone(headerConfigExample)

      const transformedHeaderData = Transformer.transformHeaders(headerData, headerConfig)

      for (const headerKey in headerDataTransformedExample) {
        test.equals(Util.getValueByCaseInsensitiveKey(transformedHeaderData, headerKey), Util.getValueByCaseInsensitiveKey(headerDataTransformedExample, headerKey))
      }
      test.equals(transformedHeaderData[Enum.Http.Headers.FSPIOP.SIGNATURE], headerDataInputExample[Enum.Http.Headers.FSPIOP.SIGNATURE])
      test.end()
    })

    transformHeadersTest.test('Transform to include map the destinationFsp if the FSPIOP-Destination header was included in the original request but correctly mapped based on headerConfig', async test => {
      const headerData = Util.clone(headerDataInputExample)
      headerData[Enum.Http.Headers.FSPIOP.HTTP_METHOD] = 'INVALID'

      // set FSPIOP-Destination from the request
      Util.setValueByCaseInsensitiveKey(headerData, Enum.Http.Headers.FSPIOP.DESTINATION, 'TESTDEST')

      const headerConfig = Util.clone(headerConfigExample)

      const transformedHeaderData = Transformer.transformHeaders(headerData, headerConfig)

      for (const headerKey in headerDataTransformedExample) {
        test.equals(Util.getValueByCaseInsensitiveKey(transformedHeaderData, headerKey), Util.getValueByCaseInsensitiveKey(headerDataTransformedExample, headerKey))
      }
      test.equals(transformedHeaderData[Enum.Http.Headers.FSPIOP.SIGNATURE], headerDataInputExample[Enum.Http.Headers.FSPIOP.SIGNATURE])
      test.end()
    })

    transformHeadersTest.end()
  })
  TransformerTest.end()
})
