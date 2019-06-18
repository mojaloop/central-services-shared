'use strict'

const Test = require('tape')
const Joi = require('@hapi/joi')

const BaseHealthCheck = require('../../src/healthCheck').BaseHealthCheck
const {
  serviceName,
  statusEnum
} = require('../../src/healthCheck').HealthCheckEnums

class TestHealthCheck extends BaseHealthCheck {
  async getSubServiceHealthDatastore () {
    return {
      name: serviceName.datastore,
      status: statusEnum.OK
    }
  }

  async getSubServiceHealthBroker () {
    return {
      name: serviceName.broker,
      status: statusEnum.OK
    }
  }
}

Test('BaseHealthCheck test', baseHealthCheckTest => {
  baseHealthCheckTest.test('getHealth', getHealthTest => {
    getHealthTest.test('gets the health with no sub services', async test => {
      // Arrange
      const baseHealthCheck = new BaseHealthCheck({ version: '1.0.0' }, [])
      const schema = {
        status: Joi.string().valid('OK').required(),
        uptime: Joi.number().required(),
        startTime: Joi.date().iso().required(),
        versionNumber: Joi.string().required(),
        services: Joi.array().required()
      }
      const expectedServices = []

      // Act
      const response = await baseHealthCheck.getHealth()

      // Assert
      const validationResult = Joi.validate(response, schema) // We use Joi to validate the results as they rely on timestamps that are variable
      test.equal(validationResult.error, null, 'The response matches the validation schema')
      test.deepEqual(response.services, expectedServices, 'The sub-services are correct')
      test.end()
    })

    getHealthTest.test('gets the health with two sub-services', async test => {
      // Arrange
      const baseHealthCheck = new TestHealthCheck({ version: '1.0.0' }, [
        serviceName.datastore,
        serviceName.broker
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
      const response = await baseHealthCheck.getHealth()

      // Assert
      const validationResult = Joi.validate(response, schema) // We use Joi to validate the results as they rely on timestamps that are variable
      test.equal(validationResult.error, null, 'The response matches the validation schema')
      test.deepEqual(response.services, expectedServices, 'The sub-services are correct')
      test.end()
    })

    getHealthTest.test('is down if getSubServiceHealth throws', async test => {
      // Arrange
      const baseHealthCheck = new BaseHealthCheck({ version: '1.0.0' }, [
        serviceName.datastore,
        serviceName.broker
      ])
      const schema = {
        status: Joi.string().valid('DOWN').required(),
        uptime: Joi.number().required(),
        startTime: Joi.date().iso().required(),
        versionNumber: Joi.string().required()
      }

      // Act
      const response = await baseHealthCheck.getHealth()

      // Assert
      const validationResult = Joi.validate(response, schema) // We use Joi to validate the results as they rely on timestamps that are variable
      test.equal(validationResult.error, null, 'The response matches the validation schema')
      test.end()
    })

    getHealthTest.end()
  })

  baseHealthCheckTest.test('getSubServiceHealth', getSubServiceHealthTest => {
    getSubServiceHealthTest.test('fails for an unknown service', async test => {
      // Arrange
      const serviceName = 'BlaBlaservice'
      const baseHealthCheck = new BaseHealthCheck({}, [])

      // Act
      try {
        await baseHealthCheck.getSubServiceHealth(serviceName)
        test.fail('Test should have failed')
      } catch (err) {
        // Assert
        test.equal(`Service: ${serviceName} not found.`, err.message, 'Expected error message to match')
        test.pass('getSubserviceHealth threw on unknown service')
      }

      test.end()
    })

    getSubServiceHealthTest.test('fails for not implemented Datastore', async test => {
      // Arrange
      const baseHealthCheck = new BaseHealthCheck({}, [])

      // Act
      try {
        await baseHealthCheck.getSubServiceHealth(serviceName.datastore)
        test.fail('Test should have failed')
      } catch (err) {
        // Assert
        test.equal(`Abstract method getSubServiceHealthDatastore not implemented`, err.message, 'Expected error message to match')
        test.pass('getSubserviceHealth threw on unimplemented service')
      }

      test.end()
    })

    getSubServiceHealthTest.test('fails for not implemented Broker', async test => {
      // Arrange
      const baseHealthCheck = new BaseHealthCheck({}, [])

      // Act
      try {
        await baseHealthCheck.getSubServiceHealth(serviceName.broker)
        test.fail('Test should have failed')
      } catch (err) {
        // Assert
        test.equal(`Abstract method getSubServiceHealthBroker not implemented`, err.message, 'Expected error message to match')
        test.pass('getSubserviceHealth threw on unimplemented service')
      }

      test.end()
    })

    getSubServiceHealthTest.end()
  })

  baseHealthCheckTest.test('evaluateServiceHealth', evaluateServiceHealthTest => {
    evaluateServiceHealthTest.test('passes if there are no services', async test => {
      // Arrange
      const services = []
      const expected = true

      // Act
      const result = BaseHealthCheck.evaluateServiceHealth(services)

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
      const result = BaseHealthCheck.evaluateServiceHealth(services)

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
      const result = BaseHealthCheck.evaluateServiceHealth(services)

      // Assert
      test.equal(result, expected, 'Service should be unhealthy')
      test.end()
    })
  })

  baseHealthCheckTest.end()
})
