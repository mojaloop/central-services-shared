const Hapi = require('@hapi/hapi')
const Test = require('tapes')(require('tape'))
const codes = require('@modusbox/mojaloop-sdk-standard-components').Errors.MojaloopApiErrorCodes
const { plugin, errorMessages } = require('../../../../../src/util/hapi/plugins/headerValidation')
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
      const { message, apiErrorCode } = req.response
      return h.response({ message, apiErrorCode }).code(apiErrorCode.httpStatusCode)
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
  const server = await init()

  pluginTest.test('validation is not performed on unconfigured resources', async t => {
    const res = await server.inject({
      method: 'get',
      url: '/unconfigured',
      headers: {
        accept: generateAcceptHeader(resource, [1]),
        'content-type': generateContentTypeHeader(resource, 1)
      }
    })
    t.is(res.statusCode, 202)
    t.end()
  })

  pluginTest.test('accept validation is performed on get requests without an accept header', async t => {
    const fspiopCode = codes.MALFORMED_SYNTAX
    const res = await server.inject({
      method: 'get',
      url: `/${resource}`,
      headers: {
        'content-type': generateContentTypeHeader(resource, 1)
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
        'content-type': generateContentTypeHeader(resource, 1)
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
    const fspiopCode = codes.MALFORMED_SYNTAX
    const res = await server.inject({
      method: 'get',
      url: `/${resource}`,
      headers: {
        'content-type': generateContentTypeHeader(resource, 1),
        accept: 'hello'
      }
    })
    t.is(res.statusCode, fspiopCode.httpStatusCode)
    const payload = JSON.parse(res.payload)
    t.is(payload.apiErrorCode.code, fspiopCode.code)
    t.is(payload.message, errorMessages.INVALID_ACCEPT_HEADER)
    t.end()
  })

  pluginTest.test('UNACCEPTABLE_VERSION/REQUESTED_VERSION_NOT_SUPPORTED', async t => {
    const fspiopCode = codes.UNACCEPTABLE_VERSION
    const res = await server.inject({
      method: 'put',
      url: `/${resource}`,
      headers: {
        'content-type': generateContentTypeHeader(resource, 1),
        accept: generateAcceptHeader(resource, [5])
      }
    })
    t.is(res.statusCode, fspiopCode.httpStatusCode)
    const payload = JSON.parse(res.payload)
    t.is(payload.apiErrorCode.code, fspiopCode.code)
    t.is(payload.message, errorMessages.REQUESTED_VERSION_NOT_SUPPORTED)
    t.end()
  })

  pluginTest.test('MALFORMED_SYNTAX/INVALID_CONTENT_TYPE_HEADER', async t => {
    const fspiopCode = codes.MALFORMED_SYNTAX
    const res = await server.inject({
      method: 'put',
      url: `/${resource}`,
      headers: {
        'content-type': 'application/json',
        accept: generateAcceptHeader(resource, [1])
      }
    })
    t.is(res.statusCode, fspiopCode.httpStatusCode)
    const payload = JSON.parse(res.payload)
    t.is(payload.apiErrorCode.code, fspiopCode.code)
    t.is(payload.message, errorMessages.INVALID_CONTENT_TYPE_HEADER)
    t.end()
  })

  pluginTest.test('UNACCEPTABLE_VERSION/SUPPLIED_VERSION_NOT_SUPPORTED', async t => {
    const fspiopCode = codes.UNACCEPTABLE_VERSION
    const res = await server.inject({
      method: 'put',
      url: `/${resource}`,
      headers: {
        'content-type': generateContentTypeHeader(resource, 5),
        accept: generateAcceptHeader(resource, [1])
      }
    })
    t.is(res.statusCode, fspiopCode.httpStatusCode)
    const payload = JSON.parse(res.payload)
    t.is(payload.apiErrorCode.code, fspiopCode.code)
    t.is(payload.message, errorMessages.SUPPLIED_VERSION_NOT_SUPPORTED)
    t.end()
  })

  pluginTest.test('correctly validates longer routes', async t => {
    const res = await server.inject({
      method: 'put',
      url: `/${resource}/MSISDN/12346`,
      headers: {
        'content-type': generateContentTypeHeader(resource, 1),
        accept: generateAcceptHeader(resource, [1])
      }
    })
    t.is(res.statusCode, 202)
    t.end()
  })

  pluginTest.test('correctly invalidates longer routes', async t => {
    const fspiopCode = codes.UNACCEPTABLE_VERSION
    const res = await server.inject({
      method: 'put',
      url: `/${resource}/MSISDN/12346`,
      headers: {
        'content-type': generateContentTypeHeader(resource, 5),
        accept: generateAcceptHeader(resource, [1])
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
        accept: generateAcceptHeader(resource, [1])
      }
    })
    t.is(res.payload, '')
    t.is(res.statusCode, 202)
    t.end()
  })

  await pluginTest.end()
})
