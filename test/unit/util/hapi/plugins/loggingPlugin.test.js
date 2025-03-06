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

 * Eugen Klymniuk <eugen.klymniuk@infitx.com>
 --------------
 **********/

const Tape = require('tapes')(require('tape'))
const sinon = require('sinon')
const Hapi = require('@hapi/hapi')
const { getPortPromise } = require('portfinder')

const { loggingPlugin } = require('#src/util/hapi/index')
const { logger } = require('#src/logger')
const { tryCatchEndTest } = require('#test/util/helper')

const createHapiServer = async ({
  log,
  internalRoutes,
  handler = async () => true
}) => {
  const server = Hapi.server({
    host: 'localhost',
    port: await getPortPromise()
  })

  await server.register({
    plugin: loggingPlugin,
    options: {
      log, internalRoutes
    }
  })

  server.route({
    method: 'GET',
    path: '/{any*}',
    handler: async (request, h) => {
      const success = await handler()
      return { success }
    }
  })
  await server.start()

  return server
}

Tape('loggingPlugin Tests -->', (pluginTests) => {
  let server
  let log

  const sendMockRequest = (url = '/', headers = {}) => server.inject({ url, headers })

  pluginTests.beforeEach(t => {
    log = sinon.spy(logger)
    t.end()
  })

  pluginTests.afterEach(async t => {
    await server?.stop()
    sinon.restore()
    t.end()
  })

  pluginTests.test('should have required hapi-plugin fields', tryCatchEndTest(t => {
    t.true(typeof loggingPlugin.name === 'string', 'name is set')
    t.true(typeof loggingPlugin.register === 'function', 'register is a function')
  }))

  pluginTests.test('should create test hapi server, and handle a request', tryCatchEndTest(async t => {
    server = await createHapiServer({ log })
    const { result } = await sendMockRequest()
    t.true(result.success, 'handler executed successfully')
    t.true(log.info.calledTwice, 'logged request and response')
  }))

  pluginTests.test('should log each incoming request with a separate requestId (using asyncLocalStorage)', tryCatchEndTest(async t => {
    const mlLogger = sinon.spy(log.mlLogger) // actual logger used to output logs
    server = await createHapiServer({
      log,
      handler: async () => {
        logger.info('inside handler') // should have access to asyncLocalStorage
        return true
      }
    })

    await Promise.all([
      sendMockRequest('/1', { traceid: '1111' }),
      sendMockRequest('/2')
    ])

    t.true(log.info.callCount === 6, 'logged both requests')
    log.info.args.forEach((arg) => {
      const logMeta = arg[1] // 2nd param, passed as object to log.info()
      t.equal(logMeta?.requestId, undefined, 'no requestId passed to 2nd param of log.info()')
    })

    const actualContexts = mlLogger.info.args.map((arg) => {
      const ctx = JSON.parse(arg[0].split(' - ').pop())
      // Actual log string looks like: [==> req] GET / - {"context":"CSSh","headers":{"host":"localhost:11000","user-agent":"shot"},"query":{},"remoteAddress":"127.0.0.1","requestId":"1733823072333:eugen-laptop:485486:m4i9hooy:10000__undefined"}
      // So we need to parse the last part of the string (after " - ") to get the context
      t.true(typeof ctx.requestId === 'string', 'requestId is added to logs using asyncLocalStorage')
      return ctx
    })
    t.notEqual(actualContexts[0].requestId, actualContexts[1].requestId, 'each request has a unique requestId')
  }))

  pluginTests.test('should log error status code in case of failed request handler', tryCatchEndTest(async t => {
    server = await createHapiServer({
      log,
      handler: async () => { throw new Error('Test Error') }
    })
    const { statusCode } = await sendMockRequest()
    t.true(statusCode === 500, 'handler failed')
    t.true(log.info.callCount === 2, 'log request/response')
    t.true(log.info.lastCall.firstArg.startsWith('[<== 500]'), 'error code is logged')
    t.ok(log.info.lastCall.lastArg.output.payload, 'error output is logged')
  }))

  pluginTests.test('should not log requests on internal routes', tryCatchEndTest(async t => {
    server = await createHapiServer({ log })
    const { result } = await sendMockRequest('/health')
    t.true(log.info.callCount === 0, 'no logs to be output')
    t.true(result.success, 'handler executed successfully')
  }))

  pluginTests.test('should not log requests if logger has logLevel higher than info', tryCatchEndTest(async t => {
    const warnLog = logger.child()
    warnLog.setLevel('warn')
    const spyLog = sinon.spy(warnLog)
    server = await createHapiServer({ log: spyLog })
    await sendMockRequest()
    t.true(spyLog.info.callCount === 0, 'no logs to be output')
  }))

  pluginTests.test('should add traceid header to requestId, and log it', tryCatchEndTest(async t => {
    const traceid = 'x-123456'
    const mlLogger = sinon.spy(log.mlLogger) // actual logger used to output logs
    server = await createHapiServer({ log })
    await sendMockRequest('/', { traceid })

    t.true(mlLogger.info.callCount === 2, 'log req/res')
    const ctx = JSON.parse(mlLogger.info.firstCall.firstArg.split(' - ').pop())
    t.true(ctx.requestId.endsWith(`__${traceid}`), 'log traceid as part of requestId')
    // requestId: "1733825870277:eugen-laptop:930049:m4ib5nli:10000__x-123456"
  }))

  pluginTests.end()
})
