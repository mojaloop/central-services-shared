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
'use strict'

const Hapi = require('@hapi/hapi')
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Joi = require('@hapi/joi')
const init = async (options) => {
  const server = await new Hapi.Server(options)

  await server.register([
    { plugin: require('../../../../../src/util/hapi/plugins/rawPayloadToDataUri') }
  ])

  server.route({
    method: 'POST',
    path: '/',
    handler: (request) => {
      return {
        payload: request.payload,
        dataUri: request.dataUri,
        rawPayload: request.rawPayload
      }
    },
    options: {
      validate: {
        payload: Joi.object({
          errorInformation: Joi.object()
        })
      }
    }
  })
  await server.start()
  console.log(`Server running at: ${server.info.uri}`)
  return server
}

Test('rawPayloadToDataUri plugin test', async (pluginTest) => {
  let sandbox

  pluginTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    t.end()
  })

  pluginTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  const okOptions = {
    host: 'localhost',
    port: 8800,
    routes: {
      payload: {
        parse: true,
        output: 'stream'
      }
    }
  }

  const nokOptions = {
    host: 'localhost',
    port: 8800
  }

  await pluginTest.test('send request with 0 size payload to test condition checking for rawBuffer length ', async assert => {
    try {
      const requestOptions = {
        method: 'POST',
        url: '/',
        payload: null
      }

      const server = await init(okOptions)

      await server.inject(requestOptions)
      await server.stop()
      assert.end()
    } catch (e) {
      console.log(e)
      assert.fail()
      assert.end()
    }
  })

  await pluginTest.test('send request and get raw data back', async assert => {
    try {
      const requestOptions = {
        method: 'POST',
        url: '/',
        payload: {
          errorInformation: {
            errorCode: '5200',
            errorDescription: 'Generic limit error, amount \u0026 payments threshold.'
          }
        }
      }

      const server = await init(okOptions)

      const response = await server.inject(requestOptions)
      const parsedPayloadRequest = JSON.parse(response.payload)
      assert.equal(response.statusCode, 200, 'status code is correct')
      assert.deepEqual(parsedPayloadRequest.payload, requestOptions.payload)
      assert.equal(parsedPayloadRequest.dataUri, 'data:application/json;base64,eyJlcnJvckluZm9ybWF0aW9uIjp7ImVycm9yQ29kZSI6IjUyMDAiLCJlcnJvckRlc2NyaXB0aW9uIjoiR2VuZXJpYyBsaW1pdCBlcnJvciwgYW1vdW50ICYgcGF5bWVudHMgdGhyZXNob2xkLiJ9fQ', 'payload is base64 encoded dataUri')
      await server.stop()
      assert.end()
    } catch (e) {
      console.log(e)
      assert.fail()
      assert.end()
    }
  })

  await pluginTest.test('send request and get back parsed payload if the options are not correct', async assert => {
    try {
      const server = await init(nokOptions)
      const requestOptions = {
        method: 'POST',
        url: '/',
        payload: {
          errorInformation: {
            errorCode: '5200',
            errorDescription: 'Generic limit error, amount \u0026 payments threshold.'
          }
        }
      }
      const response = await server.inject(requestOptions)
      const parsedPayloadRequest = JSON.parse(response.payload)
      assert.equal(response.statusCode, 200, 'status code is correct')
      assert.deepEqual(parsedPayloadRequest.payload, requestOptions.payload, 'payload is equal')
      await server.stop()
      assert.end()
    } catch (e) {
      console.log(e)
      assert.fail()
      assert.end()
    }
  })

  await pluginTest.test('send wrong content type', async assert => {
    try {
      const server = await init(okOptions)
      const requestOptions = {
        method: 'POST',
        url: '/',
        payload: {
          errorInformation: {
            errorCode: '5200',
            errorDescription: 'Generic limit error, amount \u0026 payments threshold.'
          }
        },
        headers: {
          'content-type': 'application/xml'
        }
      }
      const response = await server.inject(requestOptions)
      assert.equal(response.statusCode, 400, 'status code is correct')
      await server.stop()
      assert.end()
    } catch (e) {
      console.log(e)
      assert.fail()
      assert.end()
    }
  })

  await pluginTest.end()
})
