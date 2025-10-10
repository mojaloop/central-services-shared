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
 * Eugen Klymniuk <eugen.klymniuk@infitx.com>

 --------------
 ******/

'use strict'

const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')

const proxies = require('#src/util/proxies')
const request = require('#src/util/request')
const Http = require('#src/util/index').Http
const Config = require('#test/util/config')
const Helper = require('#test/util/helper')

Test('Proxies Participants Test', proxiesTest => {
  let sandbox
  const hubName = 'Hub'
  const hubNameRegex = /^Hub$/i

  const mockProxiesResponse = {
    data: [
      { name: 'proxy1', isActive: 1 },
      { name: 'proxy2', isActive: 0 },
      { name: 'proxy3', isActive: 1 },
      { name: 'proxy4', isActive: 0 }
    ]
  }

  proxiesTest.beforeEach(async test => {
    sandbox = Sinon.createSandbox()
    sandbox.stub(request, 'sendRequest')
    sandbox.stub(Http, 'SwitchDefaultHeaders').returns(Helper.defaultHeaders())
    test.end()
  })

  proxiesTest.afterEach(async test => {
    sandbox.restore()
    test.end()
  })

  proxiesTest.test('getAllProxiesNames method Tests', async (getAllProxiesNamesTest) => {
    getAllProxiesNamesTest.test('should return all proxy names when onlyActive is false', async (test) => {
      await proxies.initializeCache(Config.ENDPOINT_CACHE_CONFIG, { hubName, hubNameRegex })
      request.sendRequest.returns(Promise.resolve(mockProxiesResponse))

      try {
        const result = await proxies.getAllProxiesNames(Config.ENDPOINT_SOURCE_URL, false)
        test.equal(result.length, 4, 'Should return all 4 proxies')
        test.deepEqual(result, ['proxy1', 'proxy2', 'proxy3', 'proxy4'], 'Should return all proxy names')
        await proxies.stopCache()
        test.end()
      } catch (err) {
        test.fail('Error thrown', err)
        test.end()
      }
    })

    getAllProxiesNamesTest.test('should return all proxy names when onlyActive is not provided (default)', async (test) => {
      await proxies.initializeCache(Config.ENDPOINT_CACHE_CONFIG, { hubName, hubNameRegex })
      request.sendRequest.returns(Promise.resolve(mockProxiesResponse))

      try {
        const result = await proxies.getAllProxiesNames(Config.ENDPOINT_SOURCE_URL)
        test.equal(result.length, 4, 'Should return all 4 proxies')
        test.deepEqual(result, ['proxy1', 'proxy2', 'proxy3', 'proxy4'], 'Should return all proxy names')
        await proxies.stopCache()
        test.end()
      } catch (err) {
        test.fail('Error thrown', err)
        test.end()
      }
    })

    getAllProxiesNamesTest.test('should return only active proxy names when onlyActive is true', async (test) => {
      await proxies.initializeCache(Config.ENDPOINT_CACHE_CONFIG, { hubName, hubNameRegex })
      request.sendRequest.returns(Promise.resolve(mockProxiesResponse))

      try {
        const result = await proxies.getAllProxiesNames(Config.ENDPOINT_SOURCE_URL, true)
        test.equal(result.length, 2, 'Should return only 2 active proxies')
        test.deepEqual(result, ['proxy1', 'proxy3'], 'Should return only active proxy names')
        await proxies.stopCache()
        test.end()
      } catch (err) {
        test.fail('Error thrown', err)
        test.end()
      }
    })

    await getAllProxiesNamesTest.end()
  })

  proxiesTest.test('initializeCache method Tests', async (initCacheTest) => {
    initCacheTest.test('should initialize cache and return true', async (test) => {
      try {
        const result = await proxies.initializeCache(Config.ENDPOINT_CACHE_CONFIG, { hubName, hubNameRegex })
        test.equal(result, true, 'The results match')
        await proxies.stopCache()
        test.end()
      } catch (err) {
        test.fail('Error thrown', err)
        test.end()
      }
    })

    await initCacheTest.end()
  })

  proxiesTest.end()
})
