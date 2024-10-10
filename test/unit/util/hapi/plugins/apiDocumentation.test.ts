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
 - Steven Oderayi <steven.oderayi@modusbox.com>

 --------------
 ******/
'use strict';

import Hapi from '@hapi/hapi';
import tapes from 'tapes';
import tape from 'tape';

const Test = tapes(tape);
import Path from 'path';

import * as APIDocPlugin from '../../../../../src/util/hapi/plugins/apiDocumentation';
const OpenAPIDocPath = Path.resolve(__dirname, '../../../../resources/interface/swagger.yaml');

Test('API Documentation plugin should', async (pluginTest) => {
  let server;

  pluginTest.beforeEach(async test => {
    server = await new Hapi.Server({
      host: 'localhost',
      port: 8800
    });
    test.end();
  });

  pluginTest.afterEach(async test => {
    await server.stop();
    test.end();
  });

  await pluginTest.test('return API documentation in HTML format', async assert => {
    try {
      await server.register(
        { plugin: APIDocPlugin, options: { documentPath: OpenAPIDocPath } }
      );

      await server.start();

      const response = await server.inject({
        method: 'GET',
        url: '/documentation'
      });

      assert.equal(response.statusCode, 200, 'status code is correct');
      assert.ok(response.payload.indexOf('<html ') >= 0);
      assert.end();
    } catch (e) {
      console.log(e);
      assert.fail();
      assert.end();
    }
  });

  await pluginTest.test('return API spec in JSON format', async assert => {
    try {
      await server.register(
        { plugin: APIDocPlugin, options: { documentPath: OpenAPIDocPath } }
      );

      await server.start();

      const response = await server.inject({
        method: 'GET',
        url: '/swagger.json'
      });

      assert.equal(response.statusCode, 200, 'status code is correct');
      assert.ok(JSON.parse(response.payload));
      assert.end();
    } catch (e) {
      console.log(e);
      assert.fail();
      assert.end();
    }
  });

  await pluginTest.test('throw if required parameters are missing', async assert => {
    try {
      await server.register(
        { plugin: APIDocPlugin, options: { } }
      );

      await server.start();

      const response = await server.inject({
        method: 'GET',
        url: '/swagger.json'
      });

      assert.equal(response.statusCode, 200, 'status code is correct');
      assert.notOk('Should throw errow');
      assert.end();
    } catch (e) {
      assert.ok('Error thrown');
      assert.end();
    }
  });

  await pluginTest.end();
});
