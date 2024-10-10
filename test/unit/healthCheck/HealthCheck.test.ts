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

 * ModusBox
 - Georgi Georgiev <georgi.georgiev@modusbox.com>
 --------------
 ******/
'use strict';

import tapes from 'tapes';
import tape from 'tape';
import Sinon from 'sinon';
import Joi from '@hapi/joi';

import { HealthCheck } from '../../../src/healthCheck';

const Test = tapes(tape);

Test('HealthCheck test', healthCheckTest => {
  let sandbox;

  healthCheckTest.beforeEach(t => {
    sandbox = Sinon.createSandbox();
    t.end();
  });

  healthCheckTest.afterEach(t => {
    sandbox.restore();
    t.end();
  });

  healthCheckTest.test('getHealth', getHealthTest => {
    getHealthTest.test('gets the health with empty serviceChecks', async test => {
      // Arrange
      const healthCheck = new HealthCheck({ version: '1.0.0' }, []);
      const schema = Joi.compile({
        status: Joi.string().valid('OK').required(),
        uptime: Joi.number().required(),
        startTime: Joi.date().iso().required(),
        versionNumber: Joi.string().required(),
        services: Joi.array().required()
      });
      const expectedServices = [];

      // Act
      const response = await healthCheck.getHealth();

      // Assert
      const validationResult = Joi.attempt(response, schema); // We use Joi to validate the results as they rely on timestamps that are variable
      test.equal(validationResult.error, undefined, 'The response matches the validation schema');
      test.deepEqual(response.services, expectedServices, 'The sub-services are correct');
      test.end();
    });

    getHealthTest.test('gets the health with two sub-services', async test => {
      // Arrange
      const healthCheck = new HealthCheck({ version: '1.0.0' }, [
        async () => ({ name: 'datastore', status: 'OK' }),
        async () => ({ name: 'broker', status: 'OK' })
      ]);
      const schema = Joi.compile({
        status: Joi.string().valid('OK').required(),
        uptime: Joi.number().required(),
        startTime: Joi.date().iso().required(),
        versionNumber: Joi.string().required(),
        services: Joi.array().required()
      });
      const expectedServices = [
        { name: 'datastore', status: 'OK' },
        { name: 'broker', status: 'OK' }
      ];

      // Act
      const response = await healthCheck.getHealth();

      // Assert
      const validationResult = Joi.attempt(response, schema); // We use Joi to validate the results as they rely on timestamps that are variable
      test.equal(validationResult.error, undefined, 'The response matches the validation schema');
      test.deepEqual(response.services, expectedServices, 'The sub-services are correct');
      test.end();
    });

    getHealthTest.test('is down if a sub-service check throws', async test => {
      // Arrange
      const healthCheck = new HealthCheck({ version: '1.0.0' }, [
        async () => { throw new Error('Get health failed'); },
        async () => ({ name: 'broker', status: 'OK' })
      ]);
      const schema = Joi.compile({
        status: Joi.string().valid('DOWN').required(),
        uptime: Joi.number().required(),
        startTime: Joi.date().iso().required(),
        versionNumber: Joi.string().required()
      });

      // Act
      const response = await healthCheck.getHealth();

      // Assert
      const validationResult = Joi.attempt(response, schema); // We use Joi to validate the results as they rely on timestamps that are variable
      test.equal(validationResult.error, undefined, 'The response matches the validation schema');
      test.end();
    });

    getHealthTest.end();
  });

  healthCheckTest.test('evaluateServiceHealth', evaluateServiceHealthTest => {
    evaluateServiceHealthTest.test('passes if there are no services', async test => {
      // Arrange
      const services = [];
      const expected = true;

      // Act
      const result = HealthCheck.evaluateServiceHealth(services);

      // Assert
      test.equal(result, expected, 'Service should be healthy');
      test.end();
    });

    evaluateServiceHealthTest.test('passes if nothing is down', async test => {
      // Arrange
      const services = [
        { name: 'datastore', status: 'OK' },
        { name: 'broker', status: 'OK' }
      ];
      const expected = true;

      // Act
      const result = HealthCheck.evaluateServiceHealth(services);

      // Assert
      test.equal(result, expected, 'Service should be healthy');
      test.end();
    });

    evaluateServiceHealthTest.test('fails if anything is down', async test => {
      // Arrange
      const services = [
        { name: 'broker', status: 'DOWN' },
        { name: 'datastore', status: 'OK' }
      ];
      const expected = false;

      // Act
      const result = HealthCheck.evaluateServiceHealth(services);

      // Assert
      test.equal(result, expected, 'Service should be unhealthy');
      test.end();
    });

    evaluateServiceHealthTest.end();
  });

  healthCheckTest.end();
});
