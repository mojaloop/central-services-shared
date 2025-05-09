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
 - Neal Donnan <neal.donnan@modusbox.com>
 --------------
 ******/
'use strict'

const Hapi = require('@hapi/hapi')
const ErrorHandler = require('@mojaloop/central-services-error-handling')
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Logger = require('@mojaloop/central-services-logger')

Test('Event plugin test', async (pluginTest) => {
  let server
  let sandbox

  pluginTest.beforeEach(async test => {
    sandbox = Sinon.createSandbox()
    sandbox.stub(Logger, 'isDebugEnabled').value(true)
    server = await new Hapi.Server({
      host: 'localhost',
      port: 8800
    })

    await server.register([
      ErrorHandler,
      { plugin: require('../../../../../src/util/hapi/plugins/eventPlugin') }
    ])

    await server.start()

    test.end()
  })

  pluginTest.afterEach(async test => {
    await server.stop()
    sandbox.restore()
    test.end()
  })

  await pluginTest.test('create and finish a span for a route with the sampled tag', async assert => {
    try {
      let span
      server.route({
        method: 'POST',
        path: '/',
        handler: (request) => {
          span = request.span
          return 'testing'
        },
        options: {
          id: 'test_route',
          tags: ['sampled']
        }
      })

      const response = await server.inject({
        method: 'POST',
        url: '/'
      })

      assert.equal(response.statusCode, 200, 'status code is correct')
      assert.ok(span)
      assert.ok(span.isFinished)
      assert.equal(span.spanContext.service, 'test_route')
      assert.end()
    } catch (e) {
      assert.fail()
      assert.end()
    }
  })

  await pluginTest.test('create and finish a child span with http context headers', async assert => {
    try {
      let span
      server.route({
        method: 'POST',
        path: '/',
        handler: (request) => {
          span = request.span
          return 'testing'
        },
        options: {
          id: 'test_route',
          tags: ['sampled']
        }
      })
      const traceId = '9732ca939fbd9f755b5bc07c227c4cd5'
      const spanId = '74c6557725f1f0e1'
      const response = await server.inject({
        method: 'POST',
        url: '/',
        headers: {
          tracestate: `acmevendor=${Buffer.from(JSON.stringify({ spanId })).toString('base64')}`,
          traceparent: `00-${traceId}-${spanId}-00`
        }
      })

      assert.equal(response.statusCode, 200, 'status code is correct')
      assert.ok(span)
      assert.ok(span.isFinished)
      assert.equal(span.spanContext.service, 'test_route')
      assert.equal(span.spanContext.traceId, '9732ca939fbd9f755b5bc07c227c4cd5')
      assert.equal(span.spanContext.parentSpanId, spanId)

      assert.end()
    } catch (e) {
      assert.fail()
      assert.end()
    }
  })

  await pluginTest.test('do not create a span for a route without the sampled tag', async assert => {
    try {
      let span
      server.route({
        method: 'POST',
        path: '/',
        handler: (request) => {
          span = request.span
          return 'testing'
        },
        options: {
          id: 'test_route'
        }
      })

      const response = await server.inject({
        method: 'POST',
        url: '/'
      })

      assert.equal(response.statusCode, 200, 'status code is correct')
      assert.notOk(span)
      assert.end()
    } catch (e) {
      assert.fail()
      assert.end()
    }
  })

  await pluginTest.test('log an error if the response is an error', async assert => {
    try {
      let span
      server.route({
        method: 'POST',
        path: '/',
        handler: (request) => {
          span = request.span
          throw Error('testing')
        },
        options: {
          id: 'test_route',
          tags: ['sampled']
        }
      })

      const response = await server.inject({
        method: 'POST',
        url: '/'
      })

      assert.equal(response.statusCode, 500, 'status code is correct')
      assert.ok(span)
      assert.ok(span.isFinished)
      assert.equal(span.spanContext.service, 'test_route')
      assert.end()
    } catch (e) {
      assert.fail()
      assert.end()
    }
  })

  await pluginTest.test('handle an fspiop error', async assert => {
    try {
      let span
      server.route({
        method: 'POST',
        path: '/',
        handler: (request) => {
          span = request.span
          throw Error('testing')
        },
        options: {
          id: 'test_route',
          tags: ['sampled']
        }
      })

      const response = await server.inject({
        method: 'POST',
        url: '/'
      })

      assert.equal(response.statusCode, 500, 'status code is correct')
      assert.ok(span)
      assert.ok(span.isFinished)
      assert.equal(span.spanContext.service, 'test_route')
      assert.end()
    } catch (e) {
      assert.fail()
      assert.end()
    }
  })

  await pluginTest.end()
})
