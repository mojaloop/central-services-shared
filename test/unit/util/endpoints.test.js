'use strict'

const Test = require('tapes')(require('tape'))
const src = '../../../src'
const Sinon = require('sinon')
const Cache = require(`${src}/util/endpoints`)
const request = require(`${src}/util/request`)
const Catbox = require('@hapi/catbox')
const Config = require('../../util/config')
const Http = require(`${src}/util`).Http
const Enum = require(`${src}`).Enum
const Mustache = require('mustache')
const Helper = require('../../util/helper')
const Logger = require('@mojaloop/central-services-logger')
const FSPIOP_CALLBACK_URL_TRANSFER_PUT = Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TRANSFER_PUT

Test('Cache Test', cacheTest => {
  let sandbox

  cacheTest.beforeEach(async test => {
    sandbox = Sinon.createSandbox()
    sandbox.stub(request, 'sendRequest')
    sandbox.stub(Http, 'SwitchDefaultHeaders').returns(Helper.defaultHeaders())
    sandbox.stub(Logger, 'isErrorEnabled').value(true)
    sandbox.stub(Logger, 'isInfoEnabled').value(true)
    sandbox.stub(Logger, 'isDebugEnabled').value(true)
    test.end()
  })

  cacheTest.afterEach(async test => {
    sandbox.restore()
    test.end()
  })

  cacheTest.test('getEndpoint should', async (getEndpointTest) => {
    getEndpointTest.test('return the endpoint', async (test) => {
      const fsp = 'fsp'
      const url = Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET, { fsp })
      const endpointType = FSPIOP_CALLBACK_URL_TRANSFER_PUT
      const expected = 'http://localhost:1080/transfers/97b01bd3-b223-415b-b37b-ab5bef9bdbed'

      await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG)
      request.sendRequest.withArgs(url, Helper.defaultHeaders()).returns(Promise.resolve(Helper.getEndPointsResponse))

      try {
        const result = await Cache.getEndpoint(Config.ENDPOINT_SOURCE_URL, fsp, endpointType, { transferId: '97b01bd3-b223-415b-b37b-ab5bef9bdbed' })
        test.equal(result, expected, 'The results match')
        await Cache.stopCache()
        test.end()
      } catch (err) {
        test.fail('Error thrown', err)
        test.end()
      }
    })

    getEndpointTest.test('return throw an error if array not returned in response object', async (test) => {
      const fsp = 'fsp'
      const url = Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET, { fsp })
      const endpointType = FSPIOP_CALLBACK_URL_TRANSFER_PUT

      await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG)
      request.sendRequest.withArgs(url, Helper.defaultHeaders()).returns(Promise.resolve({ data: {} }))

      try {
        await Cache.getEndpoint(Config.ENDPOINT_SOURCE_URL, fsp, endpointType, { transferId: '97b01bd3-b223-415b-b37b-ab5bef9bdbed' })
        test.fail('should throw error')
        await Cache.stopCache()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error)
        await Cache.stopCache()
        test.end()
      }
    })

    getEndpointTest.test('throw error', async (test) => {
      const fsp = 'fsp1'
      const url = Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET, { fsp })
      const endpointType = FSPIOP_CALLBACK_URL_TRANSFER_PUT

      await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG)
      request.sendRequest.withArgs(url, Helper.defaultHeaders()).throws(new Error())
      try {
        await Cache.getEndpoint(Config.ENDPOINT_SOURCE_URL, fsp, endpointType)
        test.fail('should throw error')
        await Cache.stopCache()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error)
        await Cache.stopCache()
        test.end()
      }
    })

    await getEndpointTest.end()
  })

  cacheTest.test('initializeCache should', async (initializeCacheTest) => {
    initializeCacheTest.test('initializeCache cache and return true', async (test) => {
      try {
        const result = await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG)
        test.equal(result, true, 'The results match')
        await Cache.stopCache()
        test.end()
      } catch (err) {
        test.fail('Error thrown', err)
        test.end()
      }
    })

    initializeCacheTest.test('should throw error', async (test) => {
      try {
        Catbox.Client = sandbox.stub()
        Catbox.Client.throws(new Error())
        await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG)
        test.fail('should throw')
        test.end()
      } catch (err) {
        test.ok(err instanceof Error)
        test.end()
      }
    })

    await initializeCacheTest.end()
  })
  cacheTest.end()
})
