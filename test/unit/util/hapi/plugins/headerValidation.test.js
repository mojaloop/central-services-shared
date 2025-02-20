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

 * ModusBox
 - Georgi Georgiev <georgi.georgiev@modusbox.com>
 --------------
 ******/
'use strict'

const Hapi = require('@hapi/hapi')
const ErrorHandling = require('@mojaloop/central-services-error-handling')
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const { plugin, errorMessages } = require('../../../../../src/util/hapi/plugins/headerValidation')
const { protocolVersionsMap } = require('../../../../../src/util/headerValidation')
const {
  generateAcceptHeader,
  generateContentTypeHeader
} = require('../../headerValidation/support')

const resource = 'participants'

const init = async () => {
  const server = await new Hapi.Server()

  await server.register([{
    plugin
  }])

  // makes validation errors easier to inspect in server responses
  server.ext('onPreResponse', (req, h) => {
    if (req.response.name === 'FSPIOPError') {
      const { message, apiErrorCode, extensions } = req.response
      return h.response({ message, apiErrorCode, extensions }).code(apiErrorCode.httpStatusCode)
    }
    return h.continue
  })

  const handler = (request, h) => h.response().code(202)
  server.route([
    {
      method: 'get',
      path: `/${resource}`,
      handler
    },
    {
      method: 'put',
      path: `/${resource}`,
      handler
    },
    {
      method: 'put',
      path: `/${resource}/{Type}/{Id}`,
      handler
    },
    {
      method: 'post',
      path: `/${resource}`,
      handler
    },
    {
      method: 'get',
      path: '/unconfigured',
      handler
    }
  ])

  return server
}

Test('headerValidation plugin test', async (pluginTest) => {
  let sandbox

  pluginTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    t.end()
  })

  pluginTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  const server = await init()

  pluginTest.test('validation is not performed on unconfigured resources', async t => {
    const res = await server.inject({
      method: 'get',
      url: '/unconfigured',
      headers: {
        accept: generateAcceptHeader(resource, [1]),
        'content-type': generateContentTypeHeader(resource, 1),
        date: new Date().toUTCString()
      }
    })
    t.is(res.statusCode, 202)
    t.end()
  })

  pluginTest.test('accept validation is performed on get requests without an accept header', async t => {
    const fspiopCode = ErrorHandling.Enums.FSPIOPErrorCodes.MISSING_ELEMENT
    const res = await server.inject({
      method: 'get',
      url: `/${resource}`,
      headers: {
        'content-type': generateContentTypeHeader(resource, 1),
        date: new Date().toUTCString()
      }
    })
    t.is(res.statusCode, fspiopCode.httpStatusCode)
    const payload = JSON.parse(res.payload)
    t.is(payload.apiErrorCode.code, fspiopCode.code)
    t.end()
  })

  pluginTest.test('accept validation is not performed on post, put requests without an accept header', async t => {
    const opts = {
      url: `/${resource}`,
      headers: {
        'content-type': generateContentTypeHeader(resource, 1),
        date: new Date().toUTCString()
      }
    }
    await Promise.all(['post', 'put'].map(async method => {
      const res = await server.inject({ ...opts, method })
      t.is(res.payload, '')
      t.is(res.statusCode, 202)
    }))
    t.end()
  })

  pluginTest.test('MALFORMED_SYNTAX/INVALID_ACCEPT_HEADER', async t => {
    const fspiopCode = ErrorHandling.Enums.FSPIOPErrorCodes.MALFORMED_SYNTAX
    const res = await server.inject({
      method: 'get',
      url: `/${resource}`,
      headers: {
        'content-type': generateContentTypeHeader(resource, 1),
        accept: 'hello',
        date: new Date().toUTCString()
      }
    })
    t.is(res.statusCode, fspiopCode.httpStatusCode)
    const payload = JSON.parse(res.payload)
    t.is(payload.apiErrorCode.code, fspiopCode.code)
    t.is(payload.message, errorMessages.INVALID_ACCEPT_HEADER)
    t.end()
  })

  pluginTest.test('UNACCEPTABLE_VERSION/REQUESTED_VERSION_NOT_SUPPORTED', async t => {
    const fspiopCode = ErrorHandling.Enums.FSPIOPErrorCodes.UNACCEPTABLE_VERSION
    const res = await server.inject({
      method: 'put',
      url: `/${resource}`,
      headers: {
        'content-type': generateContentTypeHeader(resource, 1),
        accept: generateAcceptHeader(resource, [5]),
        date: new Date().toUTCString()
      }
    })
    t.is(res.statusCode, fspiopCode.httpStatusCode)
    const payload = JSON.parse(res.payload)
    t.is(payload.apiErrorCode.code, fspiopCode.code)
    t.is(payload.message, errorMessages.REQUESTED_VERSION_NOT_SUPPORTED)
    t.deepEqual(payload.extensions, protocolVersionsMap)
    t.end()
  })

  pluginTest.test('MALFORMED_SYNTAX/INVALID_CONTENT_TYPE_HEADER', async t => {
    const fspiopCode = ErrorHandling.Enums.FSPIOPErrorCodes.MALFORMED_SYNTAX
    const res = await server.inject({
      method: 'put',
      url: `/${resource}`,
      headers: {
        'content-type': 'application/json',
        accept: generateAcceptHeader(resource, [1]),
        date: new Date().toUTCString()
      }
    })
    t.is(res.statusCode, fspiopCode.httpStatusCode)
    const payload = JSON.parse(res.payload)
    t.is(payload.apiErrorCode.code, fspiopCode.code)
    t.is(payload.message, errorMessages.INVALID_CONTENT_TYPE_HEADER)
    t.end()
  })

  pluginTest.test('UNACCEPTABLE_VERSION/SUPPLIED_VERSION_NOT_SUPPORTED', async t => {
    const fspiopCode = ErrorHandling.Enums.FSPIOPErrorCodes.UNACCEPTABLE_VERSION
    const res = await server.inject({
      method: 'put',
      url: `/${resource}`,
      headers: {
        'content-type': generateContentTypeHeader(resource, 5),
        accept: generateAcceptHeader(resource, [1]),
        date: new Date().toUTCString()
      }
    })
    t.is(res.statusCode, fspiopCode.httpStatusCode)
    const payload = JSON.parse(res.payload)
    t.is(payload.apiErrorCode.code, fspiopCode.code)
    t.is(payload.message, errorMessages.SUPPLIED_VERSION_NOT_SUPPORTED)
    t.deepEqual(payload.extensions, protocolVersionsMap)
    t.end()
  })

  pluginTest.test('correctly validates longer routes', async t => {
    const res = await server.inject({
      method: 'put',
      url: `/${resource}/MSISDN/12346`,
      headers: {
        'content-type': generateContentTypeHeader(resource, 1),
        accept: generateAcceptHeader(resource, [1]),
        date: new Date().toUTCString()
      }
    })
    t.is(res.statusCode, 202)
    t.end()
  })

  pluginTest.test('correctly invalidates longer routes', async t => {
    const fspiopCode = ErrorHandling.Enums.FSPIOPErrorCodes.UNACCEPTABLE_VERSION
    const res = await server.inject({
      method: 'put',
      url: `/${resource}/MSISDN/12346`,
      headers: {
        'content-type': generateContentTypeHeader(resource, 5),
        accept: generateAcceptHeader(resource, [1]),
        date: new Date().toUTCString()
      }
    })
    t.is(res.statusCode, fspiopCode.httpStatusCode)
    const payload = JSON.parse(res.payload)
    t.is(payload.apiErrorCode.code, fspiopCode.code)
    t.is(payload.message, errorMessages.SUPPLIED_VERSION_NOT_SUPPORTED)
    t.end()
  })

  pluginTest.test('accepts valid accept header on get request', async t => {
    const res = await server.inject({
      method: 'get',
      url: `/${resource}`,
      headers: {
        'content-type': generateContentTypeHeader(resource, 1),
        accept: generateAcceptHeader(resource, [1]),
        date: new Date().toUTCString()
      }
    })
    t.is(res.payload, '')
    t.is(res.statusCode, 202)
    t.end()
  })

  pluginTest.test('accepts valid accept header without version', async t => {
    const res = await server.inject({
      method: 'get',
      url: `/${resource}`,
      headers: {
        'content-type': generateContentTypeHeader(resource, 1),
        accept: `application/vnd.interoperability.${resource}+json`,
        date: new Date().toUTCString()
      }
    })
    t.is(res.payload, '')
    t.is(res.statusCode, 202)
    t.end()
  })

  pluginTest.test('MALFORMED_SYNTAX/INVALID_DATE_HEADER', async t => {
    const fspiopCode = ErrorHandling.Enums.FSPIOPErrorCodes.MALFORMED_SYNTAX
    const res = await server.inject({
      method: 'put',
      url: `/${resource}`,
      headers: {
        'content-type': generateContentTypeHeader(resource, 1),
        accept: generateAcceptHeader(resource, [1]),
        date: 'invalid-date'
      }
    })
    t.is(res.statusCode, fspiopCode.httpStatusCode)
    const payload = JSON.parse(res.payload)
    t.is(payload.apiErrorCode.code, fspiopCode.code)
    t.is(payload.message, 'Invalid date header')
    t.end()
  })

  pluginTest.test('accepts valid date header', async t => {
    const res = await server.inject({
      method: 'put',
      url: `/${resource}`,
      headers: {
        'content-type': generateContentTypeHeader(resource, 1),
        accept: generateAcceptHeader(resource, [1]),
        date: new Date().toUTCString()
      }
    })
    t.is(res.payload, '')
    t.is(res.statusCode, 202)
    t.end()
  })

  pluginTest.test('throws missing element error on missing date header', async t => {
    const fspiopCode = ErrorHandling.Enums.FSPIOPErrorCodes.MISSING_ELEMENT
    const res = await server.inject({
      method: 'put',
      url: `/${resource}`,
      headers: {
        'content-type': generateContentTypeHeader(resource, 1),
        accept: generateAcceptHeader(resource, [1])
      }
    })
    t.is(res.statusCode, fspiopCode.httpStatusCode)
    const payload = JSON.parse(res.payload)
    t.is(payload.apiErrorCode.code, fspiopCode.code)
    t.end()
  })

  await pluginTest.end()
})
