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
 * Name Surname <name.surname@gatesfoundation.com>

 * Neal Donnan <neal.donnan@modusbox.com>
 --------------
 ******/
'use strict'

const Hapi = require('@hapi/hapi')
const Test = require('tapes')(require('tape'))

Test('Event plugin test', async (pluginTest) => {
  let server

  pluginTest.beforeEach(async test => {
    server = await new Hapi.Server({
      host: 'localhost',
      port: 8800
    })

    await server.register([
      { plugin: require('../../../../../src/util/hapi/plugins/eventPlugin') }
    ])

    await server.start()

    test.end()
  })

  pluginTest.afterEach(async test => {
    await server.stop()
    test.end()
  })

  await pluginTest.test('handle an error', async assert => {
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
