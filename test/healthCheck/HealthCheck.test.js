'use strict'

const Test = require('tape')
const Joi = require('@hapi/joi')

const HealthCheck = require('../../src/healthCheck').HealthCheck

Test('HealthCheck test', healthCheckTest => {
  healthCheckTest.test('getHealth', getHealthTest => {
    getHealthTest.test('gets the health with empty serviceChecks', async test => {
      // Arrange
      const healthCheck = new HealthCheck({ version: '1.0.0' }, [])
      const schema = {
        status: Joi.string().valid('OK').required(),
        uptime: Joi.number().required(),
        startTime: Joi.date().iso().required(),
        versionNumber: Joi.string().required(),
        services: Joi.array().required()
      }
      const expectedServices = []

      // Act
      const response = await healthCheck.getHealth()

      // Assert
      const validationResult = Joi.validate(response, schema) // We use Joi to validate the results as they rely on timestamps that are variable
      test.equal(validationResult.error, null, 'The response matches the validation schema')
      test.deepEqual(response.services, expectedServices, 'The sub-services are correct')
      test.end()
    })

    getHealthTest.test('gets the health with two sub-services', async test => {
      // Arrange
      const healthCheck = new HealthCheck({ version: '1.0.0' }, [
        async () => ({ name: 'datastore', status: 'OK' }),
        async () => ({ name: 'broker', status: 'OK' })
      ])
      const schema = {
        status: Joi.string().valid('OK').required(),
        uptime: Joi.number().required(),
        startTime: Joi.date().iso().required(),
        versionNumber: Joi.string().required(),
        services: Joi.array().required()
      }
      const expectedServices = [
        { name: 'datastore', status: 'OK' },
        { name: 'broker', status: 'OK' }
      ]

      // Act
      const response = await healthCheck.getHealth()

      // Assert
      const validationResult = Joi.validate(response, schema) // We use Joi to validate the results as they rely on timestamps that are variable
      test.equal(validationResult.error, null, 'The response matches the validation schema')
      test.deepEqual(response.services, expectedServices, 'The sub-services are correct')
      test.end()
    })

    getHealthTest.test('is down if a sub-service check throws', async test => {
      // Arrange
      const healthCheck = new HealthCheck({ version: '1.0.0' }, [
        async () => { throw new Error('Get health failed') },
        async () => ({ name: 'broker', status: 'OK' })
      ])
      const schema = {
        status: Joi.string().valid('DOWN').required(),
        uptime: Joi.number().required(),
        startTime: Joi.date().iso().required(),
        versionNumber: Joi.string().required()
      }

      // Act
      const response = await healthCheck.getHealth()

      // Assert
      const validationResult = Joi.validate(response, schema) // We use Joi to validate the results as they rely on timestamps that are variable
      test.equal(validationResult.error, null, 'The response matches the validation schema')
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
  })

  healthCheckTest.end()
})
