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
 - Rajiv Mothilal <rajiv.mothilal@modusbox.com>

 --------------
 ******/
'use strict';

import Hapi from '@hapi/hapi';
import ErrorHandler from '@mojaloop/central-services-error-handling';
import tapes from 'tapes';
import tape from 'tape';
const Test = tapes(tape);
import Sinon from 'sinon';
import Path from 'path';

import { OpenapiBackend } from '../../../../../src/util';
import * as Handlers from '../../../../util/handlers';
import { Hapi as UtilHapi } from '../../../../../src/util';

Test('Openapi Backend Validator plugin test should', async (pluginTest) => {
  let server;
  let sandbox;

  pluginTest.beforeEach(async test => {
    sandbox = Sinon.createSandbox();
    server = await new Hapi.Server({
      host: 'localhost',
      port: 8800
    });
    const api = await OpenapiBackend.initialise(Path.resolve(__dirname, '../../../../resources/interface/swagger.yaml'), Handlers);
    await server.register([
      ErrorHandler,
      { plugin: UtilHapi.OpenapiBackendValidator }
    ]);
    await server.register({
      plugin: {
        name: 'openapi',
        version: '1.0.0',
        multiple: true,
        register: function (server, options) {
          server.expose('openapi', options.openapi);
        }
      },
      options: {
        openapi: api
      }
    });
    server.route({
      method: ['GET', 'POST', 'PUT', 'DELETE'],
      path: '/{path*}',
      handler: (req, h) => {
        return api.handleRequest(
          {
            method: req.method,
            path: req.path,
            body: req.payload,
            query: req.query,
            headers: req.headers
          },
          req,
          h
        );
      }
    });
    await server.start();

    test.end();
  });

  pluginTest.afterEach(async test => {
    await server.stop();
    sandbox.restore();
    test.end();
  });

  await pluginTest.test('update the request object with the operationId, tags', async assert => {
    try {
      const response = await server.inject({
        method: 'GET',
        url: '/health'
      });

      assert.equal(response.statusCode, 200, 'status code is correct');
      assert.ok(response.request.route.settings.tags);
      assert.ok(response.request.route.settings.id);
      assert.end();
    } catch (e) {
      assert.fail();
      assert.end();
    }
  });

  await pluginTest.test('not update the request object with the operationId, tags', async assert => {
    try {
      const response = await server.inject({
        method: 'GET',
        url: '/fakeHealth'
      });

      assert.equal(response.statusCode, 200, 'status code is correct');
      assert.notOk(response.request.route.settings.tags);
      assert.notOk(response.request.route.settings.id);
      assert.end();
    } catch (e) {
      assert.fail();
      assert.end();
    }
  });

  await pluginTest.test('not update the request object with the operationId, should thrown 400', async assert => {
    try {
      const response = await server.inject({
        method: 'PUT',
        url: '/health'
      });
      assert.equal(response.statusCode, 405, 'method not allowed');
      assert.equal(response.result.errorInformation.errorCode, '3000');
      assert.end();
    } catch (e) {
      assert.fail();
      assert.end();
    }
  });

  await pluginTest.test('not update the request object with the operationId, should throw 404', async assert => {
    try {
      const response = await server.inject({
        method: 'PUT',
        url: '/invaliduri'
      });
      assert.equal(response.statusCode, 404, 'status code is correct');
      assert.equal(response.result.errorInformation.errorCode, '3002');
      assert.end();
    } catch (e) {
      assert.fail();
      assert.end();
    }
  });

  await pluginTest.end();
});
