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

const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Joi = require('joi')
const Metrics = require('@mojaloop/central-services-metrics')

const HealthCheck = require('../../../src/healthCheck').HealthCheck

Test('HealthCheck test', healthCheckTest => {
  let sandbox

  healthCheckTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    t.end()
  })

  healthCheckTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  healthCheckTest.test('getHealth', getHealthTest => {
    getHealthTest.test('gets the health with empty serviceChecks', async test => {
      // Arrange
      const healthCheck = new HealthCheck({ version: '1.0.0' }, [])
      const schema = Joi.compile({
        status: Joi.string().valid('OK').required(),
        uptime: Joi.number().required(),
        startTime: Joi.date().iso().required(),
        versionNumber: Joi.string().required(),
        services: Joi.array().required()
      })
      const expectedServices = []

      // Act
      const response = await healthCheck.getHealth()

      // Assert
      const validationResult = Joi.attempt(response, schema) // We use Joi to validate the results as they rely on timestamps that are variable
      test.equal(validationResult.error, undefined, 'The response matches the validation schema')
      test.deepEqual(response.services, expectedServices, 'The sub-services are correct')
      test.end()
    })

    getHealthTest.test('gets the health with two sub-services', async test => {
      // Arrange
      const healthCheck = new HealthCheck({ version: '1.0.0' }, [
        async () => ({ name: 'datastore', status: 'OK' }),
        async () => ({ name: 'broker', status: 'OK' })
      ])
      const schema = Joi.compile({
        status: Joi.string().valid('OK').required(),
        uptime: Joi.number().required(),
        startTime: Joi.date().iso().required(),
        versionNumber: Joi.string().required(),
        services: Joi.array().required()
      })
      const expectedServices = [
        { name: 'datastore', status: 'OK' },
        { name: 'broker', status: 'OK' }
      ]

      // Act
      const response = await healthCheck.getHealth()

      // Assert
      const validationResult = Joi.attempt(response, schema) // We use Joi to validate the results as they rely on timestamps that are variable
      test.equal(validationResult.error, undefined, 'The response matches the validation schema')
      test.deepEqual(response.services, expectedServices, 'The sub-services are correct')
      test.end()
    })

    getHealthTest.test('is down if a sub-service check throws', async test => {
      // Arrange
      const healthCheck = new HealthCheck({ version: '1.0.0' }, [
        async () => { throw new Error('Get health failed') },
        async () => ({ name: 'broker', status: 'OK' })
      ])
      const schema = Joi.compile({
        status: Joi.string().valid('DOWN').required(),
        uptime: Joi.number().required(),
        startTime: Joi.date().iso().required(),
        versionNumber: Joi.string().required()
      })

      // Act
      const response = await healthCheck.getHealth()

      // Assert
      const validationResult = Joi.attempt(response, schema) // We use Joi to validate the results as they rely on timestamps that are variable
      test.equal(validationResult.error, undefined, 'The response matches the validation schema')
      test.end()
    })

    getHealthTest.end()
  })

  healthCheckTest.test('evaluateServiceHealth', evaluateServiceHealthTest => {
    evaluateServiceHealthTest.test('passes if there are no services', async test => {
      // Arrange
      const services = []
      const expected = true

      // Act
      const result = HealthCheck.evaluateServiceHealth(services)

      // Assert
      test.equal(result, expected, 'Service should be healthy')
      test.end()
    })

    evaluateServiceHealthTest.test('passes if nothing is down', async test => {
      // Arrange
      const services = [
        { name: 'datastore', status: 'OK' },
        { name: 'broker', status: 'OK' }
      ]
      const expected = true

      // Act
      const result = HealthCheck.evaluateServiceHealth(services)

      // Assert
      test.equal(result, expected, 'Service should be healthy')
      test.end()
    })

    evaluateServiceHealthTest.test('fails if anything is down', async test => {
      // Arrange
      const services = [
        { name: 'broker', status: 'DOWN' },
        { name: 'datastore', status: 'OK' }
      ]
      const expected = false

      // Act
      const result = HealthCheck.evaluateServiceHealth(services)

      // Assert
      test.equal(result, expected, 'Service should be unhealthy')
      test.end()
    })

    evaluateServiceHealthTest.end()
  })

  healthCheckTest.test('getHealth metrics', metricsTest => {
    let metricsMock

    metricsTest.beforeEach(t => {
      metricsMock = {
        getCounter: Sinon.stub().returns({ inc: Sinon.spy() })
      }
      // Mock Metrics
      sandbox.stub(Metrics, 'getCounter').callsFake(metricsMock.getCounter)
      t.end()
    })

    metricsTest.afterEach(t => {
      sandbox.restore()
      t.end()
    })

    metricsTest.test('increments counter when unhealthy', async test => {
      // Arrange
      const healthCheck = new HealthCheck({ version: '1.0.0' }, [
        async () => ({ status: 'DOWN', name: 'datastore' })
      ])
      // Act
      await healthCheck.getHealth()
      // Assert
      test.ok(metricsMock.getCounter.calledWith('app-critical-total'), 'getCounter called')
      // Subservice counter should be incremented
      test.deepEqual(metricsMock.getCounter().inc.firstCall.args, [{ service: 'datastore' }], 'counter incremented for datastore service')
      // General counter should be incremented
      test.deepEqual(metricsMock.getCounter().inc.secondCall.args, [{ service: 'general' }], 'counter incremented for general service')
      test.end()
    })

    metricsTest.test('increments counter for multiple sub-services with mixed health', async test => {
      // Arrange
      const healthCheck = new HealthCheck({ version: '1.0.0' }, [
        async () => ({ status: 'OK', name: 'datastore' }),
        async () => ({ status: 'DOWN', name: 'broker' }),
        async () => ({ status: 'OK', name: 'cache' })
      ])
      // Act
      await healthCheck.getHealth()
      // Assert
      // Subservice counter incremented for DOWN service
      test.deepEqual(metricsMock.getCounter().inc.firstCall.args, [{ service: 'broker' }], 'counter incremented for broker')
      // General counter incremented
      test.deepEqual(metricsMock.getCounter().inc.secondCall.args, [{ service: 'general' }], 'counter incremented for general service')
      test.equal(metricsMock.getCounter().inc.callCount, 2, 'getCounter.inc called for each DOWN service and general')
      test.end()
    })

    metricsTest.test('handles errors thrown in setGeneralMetrics gracefully', async test => {
      // Arrange
      const healthCheck = new HealthCheck({ version: '1.0.0' }, [
        async () => ({ status: 'OK', name: 'datastore' })
      ])
      // Patch setGeneralMetrics to throw
      const origSetGeneralMetrics = healthCheck.setGeneralMetrics
      healthCheck.setGeneralMetrics = () => { throw new Error('General metrics error') }
      // Act & Assert
      try {
        await healthCheck.getHealth()
        test.pass('No error thrown when setGeneralMetrics throws')
      } catch (err) {
        test.fail('Should not throw when setGeneralMetrics throws')
      }
      // Restore
      healthCheck.setGeneralMetrics = origSetGeneralMetrics
      test.end()
    })

    metricsTest.test('does not call getCounter if no subservice is DOWN', async test => {
      // Arrange
      const healthCheck = new HealthCheck({ version: '1.0.0' }, [
        async () => ({ status: 'OK', name: 'datastore' }),
        async () => ({ status: 'OK', name: 'broker' })
      ])
      // Act
      await healthCheck.getHealth()
      // Assert
      test.equal(metricsMock.getCounter().inc.callCount, 0, 'getCounter.inc not called when all services are healthy')
      test.end()
    })

    metricsTest.test('calls getCounter only for DOWN subservices', async test => {
      // Arrange
      const healthCheck = new HealthCheck({ version: '1.0.0' }, [
        async () => ({ status: 'DOWN', name: 'datastore' }),
        async () => ({ status: 'OK', name: 'broker' }),
        async () => ({ status: 'DOWN', name: 'cache' })
      ])
      // Act
      await healthCheck.getHealth()
      // Assert
      test.deepEqual(metricsMock.getCounter().inc.getCall(0).args, [{ service: 'datastore' }], 'counter incremented for datastore')
      test.deepEqual(metricsMock.getCounter().inc.getCall(1).args, [{ service: 'cache' }], 'counter incremented for cache')
      test.deepEqual(metricsMock.getCounter().inc.getCall(2).args, [{ service: 'general' }], 'counter incremented for general')
      test.equal(metricsMock.getCounter().inc.callCount, 3, 'getCounter.inc called for each DOWN service and general')
      test.end()
    })

    metricsTest.test('handles errors thrown in setSubServiceMetrics gracefully', async test => {
      // Arrange
      const healthCheck = new HealthCheck({ version: '1.0.0' }, [
        async () => ({ status: 'DOWN', name: 'datastore' })
      ])
      // Stub Metrics.getCounter to throw when called
      sandbox.restore() // Remove previous stubs
      const getCounterStub = sandbox.stub(Metrics, 'getCounter').throws(new Error('Subservice metrics error'))
      // Stub Logger.error to spy on error logging
      const loggerErrorStub = sandbox.stub(require('@mojaloop/central-services-logger'), 'error')
      // Act
      await healthCheck.getHealth()
      // Assert
      test.ok(getCounterStub.called, 'getCounter called and throws')
      test.ok(loggerErrorStub.called, 'Logger.error called when setSubServiceMetrics throws')
      test.ok(loggerErrorStub.firstCall.args[0].includes('Failed to set subservice metrics'), 'Correct error message logged')
      loggerErrorStub.restore()
      test.end()
    })
    metricsTest.end()
  })
  healthCheckTest.end()
})
