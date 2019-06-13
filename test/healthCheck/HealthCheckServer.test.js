'use strict'

const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Hapi = require('@hapi/hapi')

const {
  createHealthCheckServer,
  defaultHealthHandler,
  failAction
} = require('../../src/healthCheck/HealthCheckServer')
const BaseHealthCheck = require('../../src/healthCheck').BaseHealthCheck

Test('HealthCheckServer test', function (healthCheckServerTest) {
  let sandbox

  healthCheckServerTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    sandbox.stub(Hapi, 'server')
    t.end()
  })

  healthCheckServerTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  healthCheckServerTest.test('defaultHealthHandler', defaultHealthHandlerTest => {
    defaultHealthHandlerTest.test('returns the default health handler', async test => {
      // Arrange
      const baseHealthCheck = new BaseHealthCheck({ version: '1.0.0' }, [])
      sandbox.stub(baseHealthCheck, 'getHealth')
      baseHealthCheck.getHealth.returns({})
      const codeStub = sandbox.stub()
      const responseStub = sandbox.stub().returns({ code: codeStub })
      const h = {
        response: responseStub
      }

      // Act
      const handler = defaultHealthHandler(baseHealthCheck)
      await handler(null, h)

      // Assert
      test.ok(codeStub.called, 'codeStub has been called')
      test.ok(responseStub.called, 'responseStub has been called')
      test.end()
    })

    defaultHealthHandlerTest.test('still calls response if health check fails', async test => {
      // Arrange
      const baseHealthCheck = new BaseHealthCheck({ version: '1.0.0' }, [])
      sandbox.stub(baseHealthCheck, 'getHealth')
      baseHealthCheck.getHealth.throws(new Error('Get health failed'))
      const codeStub = sandbox.stub()
      const responseStub = sandbox.stub().returns({ code: codeStub })
      const h = {
        response: responseStub
      }

      // Act
      const handler = defaultHealthHandler(baseHealthCheck)
      await handler(null, h)

      // Assert
      test.ok(codeStub.called, 'codeStub has been called')
      test.ok(responseStub.called, 'responseStub has been called')
      test.end()
    })

    defaultHealthHandlerTest.test('health check passes with OK status', async test => {
      // Arrange
      const baseHealthCheck = new BaseHealthCheck({ version: '1.0.0' }, [])
      sandbox.stub(baseHealthCheck, 'getHealth')
      baseHealthCheck.getHealth.resolves({ status: 'OK' })
      const codeStub = sandbox.stub()
      const responseStub = sandbox.stub().returns({ code: codeStub })
      const h = {
        response: responseStub
      }

      // Act
      const handler = defaultHealthHandler(baseHealthCheck)
      await handler(null, h)

      // Assert
      test.ok(codeStub.called, 'codeStub has been called')
      test.ok(responseStub.called, 'responseStub has been called')
      test.end()
    })

    defaultHealthHandlerTest.end()
  })

  healthCheckServerTest.test('createHealthCheckServer', createHealthCheckServerTest => {
    createHealthCheckServerTest.test('starts the server', async test => {
      // Arrange
      const routeStub = sandbox.stub()
      const startStub = sandbox.stub()
      Hapi.server.returns({
        route: routeStub,
        start: startStub,
        info: {
          uri: 'localhost:1234'
        }
      })

      // Act
      await createHealthCheckServer('1234', () => {})

      // Assert
      test.ok(routeStub.called, 'routeStub has been called')
      test.ok(startStub.called, 'startStub has been called')
      test.end()
    })

    createHealthCheckServerTest.end()
  })

  healthCheckServerTest.test('failAction', failActionTest => {
    failActionTest.test('Throws the error', async test => {
      // Arrange
      const error = new Error('Basic error message')
      const expected = 500

      // Act
      try {
        await failAction(null, null, error)
        test.fail('Should have thrown an exception')
      } catch (err) {
        // Assert
        test.equal(err.output.statusCode, expected, 'Status Codes should match')
        test.pass()
      }

      test.end()
    })

    failActionTest.end()
  })

  healthCheckServerTest.end()
})
