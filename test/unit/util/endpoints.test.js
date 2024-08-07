'use strict'

const Test = require('tapes')(require('tape'))
const Mustache = require('mustache')
const Catbox = require('@hapi/catbox')
const Logger = require('@mojaloop/central-services-logger')
const Sinon = require('sinon')
const Proxyquire = require('proxyquire')

const src = '../../../src'
const Cache = Proxyquire(`${src}/util/endpoints`, {
  '@mojaloop/inter-scheme-proxy-cache-lib': {
    createProxyCache () {
      return {
        async connect () {},
        lookupProxyByDfspId () {
          return 'fsp'
        },
        async healthCheck () {
          return true
        },
        async disconnect () {
          return true
        }
      }
    }
  }
})
const request = require(`${src}/util/request`)
const Config = require('../../util/config')
const Http = require(`${src}/util`).Http
const Enum = require(`${src}`).Enum
const Helper = require('../../util/helper')
const FSPIOP_CALLBACK_URL_TRANSFER_PUT =
  Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TRANSFER_PUT
const Metrics = require('@mojaloop/central-services-metrics')

Test('Cache Test', (cacheTest) => {
  let sandbox
  const hubName = 'Hub'
  const hubNameRegex = /^Hub$/i

  cacheTest.beforeEach(async (test) => {
    Metrics.setup({
      INSTRUMENTATION: {
        METRICS: {
          DISABLED: false,
          config: {
            timeout: 5000,
            prefix: 'moja_ml_',
            defaultLabels: {
              serviceName: 'ml-service'
            }
          }
        }
      }
    })
    sandbox = Sinon.createSandbox()
    sandbox.stub(request, 'sendRequest')
    sandbox.stub(Http, 'SwitchDefaultHeaders').returns(Helper.defaultHeaders())
    sandbox.stub(Logger, 'isErrorEnabled').value(true)
    sandbox.stub(Logger, 'isInfoEnabled').value(true)
    sandbox.stub(Logger, 'isDebugEnabled').value(true)
    test.end()
  })

  cacheTest.afterEach(async (test) => {
    sandbox.restore()
    test.end()
  })

  cacheTest.test('getEndpoint should', async (getEndpointTest) => {
    getEndpointTest.test('return the endpoint', async (test) => {
      const fsp = 'fsp'
      const url = Mustache.render(
        Config.ENDPOINT_SOURCE_URL +
          Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET,
        { fsp }
      )
      const endpointType = FSPIOP_CALLBACK_URL_TRANSFER_PUT
      const expected =
        'http://localhost:1080/transfers/97b01bd3-b223-415b-b37b-ab5bef9bdbed'

      await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG, {
        hubName, hubNameRegex
      })
      request.sendRequest
        .withArgs({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex })
        .returns(Promise.resolve(Helper.getEndPointsResponse))

      try {
        const result = await Cache.getEndpoint(
          Config.ENDPOINT_SOURCE_URL,
          fsp,
          endpointType,
          { transferId: '97b01bd3-b223-415b-b37b-ab5bef9bdbed' }
        )
        test.equal(result, expected, 'The results match')

        const result2 = await Cache.getEndpoint(
          Config.ENDPOINT_SOURCE_URL,
          fsp,
          endpointType,
          { transferId: '97b01bd3-b223-415b-b37b-ab5bef9bdbed' },
          { path: '/additionalPath' }
        )
        test.equal(result2, `${expected}/additionalPath`, 'The results match')

        await Cache.stopCache()
        test.end()
      } catch (err) {
        test.fail('Error thrown', err)
        test.end()
      }
    })

    getEndpointTest.test('return the endpoint using proxy', async (test) => {
      const fsp = 'fsp'
      const proxiedFsp = 'proxied'
      const url = Mustache.render(
        Config.ENDPOINT_SOURCE_URL +
          Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET,
        { fsp }
      )
      const proxiedUrl = Mustache.render(
        Config.ENDPOINT_SOURCE_URL +
          Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET,
        { fsp: proxiedFsp }
      )
      const endpointType = FSPIOP_CALLBACK_URL_TRANSFER_PUT
      const expected = {
        url: 'http://localhost:1080/transfers/97b01bd3-b223-415b-b37b-ab5bef9bdbed',
        proxyId: 'fsp'
      }

      await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG, {
        hubName, hubNameRegex
      })
      request.sendRequest
        .withArgs({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex })
        .returns(Promise.resolve(Helper.getEndPointsResponse))
      request.sendRequest
        .withArgs({ url: proxiedUrl, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex })
        .rejects(new Error('Not found'))

      try {
        test.equal(await Cache.healthCheckProxy(), true, 'Health check proxy if not created')
        test.equal(await Cache.stopProxy(), undefined, 'Stop proxy if not created')

        const result = await Cache.getEndpoint(
          Config.ENDPOINT_SOURCE_URL,
          proxiedFsp,
          endpointType,
          { transferId: '97b01bd3-b223-415b-b37b-ab5bef9bdbed' },
          undefined,
          { enabled: true }
        )
        test.deepEqual(result, expected, 'The results match')
        test.equal(await Cache.healthCheckProxy(), true, 'Health check proxy')
        test.equal(await Cache.stopProxy(), true, 'Stop proxy')

        await Cache.stopCache()
        test.end()
      } catch (err) {
        test.fail('Error thrown', err)
        test.end()
      }
    })

    getEndpointTest.test(
      'return the endpoint if catbox returns decoratedValue object',
      async (test) => {
        const fsp = 'fsp'
        const url = Mustache.render(
          Config.ENDPOINT_SOURCE_URL +
            Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET,
          { fsp }
        )
        const endpointType = FSPIOP_CALLBACK_URL_TRANSFER_PUT
        const expected =
          'http://localhost:1080/transfers/97b01bd3-b223-415b-b37b-ab5bef9bdbed'

        await Cache.initializeCache(
          { ...Config.ENDPOINT_CACHE_CONFIG, getDecoratedValue: true },
          { hubName, hubNameRegex }
        )
        request.sendRequest
          .withArgs({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex })
          .returns(Promise.resolve(Helper.getEndPointsResponse))

        try {
          const result = await Cache.getEndpoint(
            Config.ENDPOINT_SOURCE_URL,
            fsp,
            endpointType,
            { transferId: '97b01bd3-b223-415b-b37b-ab5bef9bdbed' }
          )
          test.equal(result, expected, 'The results match')

          const result2 = await Cache.getEndpoint(
            Config.ENDPOINT_SOURCE_URL,
            fsp,
            endpointType,
            { transferId: '97b01bd3-b223-415b-b37b-ab5bef9bdbed' },
            { path: '/additionalPath' }
          )
          test.equal(
            result2,
            `${expected}/additionalPath`,
            'The results match'
          )

          await Cache.stopCache()
          test.end()
        } catch (err) {
          test.fail('Error thrown', err)
          test.end()
        }
      }
    )

    getEndpointTest.test(
      'return the endpoint if catbox returns decoratedValue object',
      async (test) => {
        const fsp = 'fsp'
        const url = Mustache.render(
          Config.ENDPOINT_SOURCE_URL +
            Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET,
          { fsp }
        )
        const endpointType = FSPIOP_CALLBACK_URL_TRANSFER_PUT
        const expected =
          'http://localhost:1080/transfers/97b01bd3-b223-415b-b37b-ab5bef9bdbed'

        await Cache.initializeCache(
          { ...Config.ENDPOINT_CACHE_CONFIG, getDecoratedValue: true },
          { hubName, hubNameRegex }
        )
        request.sendRequest
          .withArgs({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex })
          .returns(Promise.resolve(Helper.getEndPointsResponse))

        try {
          const result = await Cache.getEndpoint(
            Config.ENDPOINT_SOURCE_URL,
            fsp,
            endpointType,
            { transferId: '97b01bd3-b223-415b-b37b-ab5bef9bdbed' }
          )
          test.equal(result, expected, 'The results match')
          await Cache.stopCache()
          test.end()
        } catch (err) {
          test.fail('Error thrown', err)
          test.end()
        }
      }
    )

    getEndpointTest.test(
      'return throw an error if array not returned in response object',
      async (test) => {
        const fsp = 'fsp'
        const url = Mustache.render(
          Config.ENDPOINT_SOURCE_URL +
            Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET,
          { fsp }
        )
        const endpointType = FSPIOP_CALLBACK_URL_TRANSFER_PUT

        await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG, {
          hubNameRegex
        })
        request.sendRequest
          .withArgs({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex })
          .returns(Promise.resolve({ data: {} }))

        try {
          await Cache.getEndpoint(
            Config.ENDPOINT_SOURCE_URL,
            fsp,
            endpointType,
            { transferId: '97b01bd3-b223-415b-b37b-ab5bef9bdbed' }
          )
          test.fail('should throw error')
        } catch (e) {
          test.ok(e instanceof Error)
        }
        await Cache.stopCache()
        test.end()
      }
    )

    getEndpointTest.test('throw error', async (test) => {
      const fsp = 'fsp1'
      const url = Mustache.render(
        Config.ENDPOINT_SOURCE_URL +
          Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET,
        { fsp }
      )
      const endpointType = FSPIOP_CALLBACK_URL_TRANSFER_PUT

      await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG, {
        hubNameRegex
      })
      request.sendRequest
        .withArgs({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex })
        .throws(new Error())
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

  cacheTest.test(
    'getEndpointAndRender should',
    async (getEndpointAndRenderTest) => {
      getEndpointAndRenderTest.test(
        'return the rendered endpoint',
        async (test) => {
          const fsp = 'fsp'
          const url = Mustache.render(
            Config.ENDPOINT_SOURCE_URL +
              Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET,
            { fsp }
          )
          const endpointType = FSPIOP_CALLBACK_URL_TRANSFER_PUT
          const expected =
            'http://localhost:1080/transfers/97b01bd3-b223-415b-b37b-ab5bef9bdbed'

          await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG, {
            hubName, hubNameRegex
          })
          request.sendRequest
            .withArgs({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex })
            .returns(Promise.resolve(Helper.getEndpointAndRenderResponse))

          try {
            const result = await Cache.getEndpointAndRender(
              Config.ENDPOINT_SOURCE_URL,
              fsp,
              endpointType,
              'transfers/{{transferId}}',
              { transferId: '97b01bd3-b223-415b-b37b-ab5bef9bdbed' }
            )
            test.equal(result, expected, 'The results match')
            await Cache.stopCache()
            test.end()
          } catch (err) {
            test.fail('Error thrown', err)
            test.end()
          }
        }
      )

      getEndpointAndRenderTest.test(
        'return the rendered endpoint if catbox returns decoratedValue object',
        async (test) => {
          const fsp = 'fsp'
          const url = Mustache.render(
            Config.ENDPOINT_SOURCE_URL +
              Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET,
            { fsp }
          )
          const endpointType = FSPIOP_CALLBACK_URL_TRANSFER_PUT
          const expected =
            'http://localhost:1080/transfers/97b01bd3-b223-415b-b37b-ab5bef9bdbed'

          await Cache.initializeCache(
            { ...Config.ENDPOINT_CACHE_CONFIG, getDecoratedValue: true },
            { hubName, hubNameRegex }
          )
          request.sendRequest
            .withArgs({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex })
            .returns(Promise.resolve(Helper.getEndpointAndRenderResponse))

          try {
            const result = await Cache.getEndpointAndRender(
              Config.ENDPOINT_SOURCE_URL,
              fsp,
              endpointType,
              'transfers/{{transferId}}',
              { transferId: '97b01bd3-b223-415b-b37b-ab5bef9bdbed' }
            )
            test.equal(result, expected, 'The results match')
            await Cache.stopCache()
            test.end()
          } catch (err) {
            test.fail('Error thrown', err)
            test.end()
          }
        }
      )

      getEndpointAndRenderTest.test(
        'return throw an error if array not returned in response object',
        async (test) => {
          const fsp = 'fsp'
          const url = Mustache.render(
            Config.ENDPOINT_SOURCE_URL +
              Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET,
            { fsp }
          )
          const endpointType = FSPIOP_CALLBACK_URL_TRANSFER_PUT

          await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG, { hubName, hubNameRegex })
          request.sendRequest
            .withArgs({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex })
            .returns(Promise.resolve({ data: {} }))

          try {
            await Cache.getEndpointAndRender(
              Config.ENDPOINT_SOURCE_URL,
              fsp,
              endpointType,
              'transfers/{{transferId}}',
              { transferId: '97b01bd3-b223-415b-b37b-ab5bef9bdbed' }
            )
            test.fail('should throw error')
            await Cache.stopCache()
            test.end()
          } catch (e) {
            test.ok(e instanceof Error)
            await Cache.stopCache()
            test.end()
          }
        }
      )

      getEndpointAndRenderTest.test('throw error', async (test) => {
        const fsp = 'fsp1'
        const url = Mustache.render(
          Config.ENDPOINT_SOURCE_URL +
            Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET,
          { fsp }
        )
        const endpointType = FSPIOP_CALLBACK_URL_TRANSFER_PUT

        await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG, { hubName, hubNameRegex })
        request.sendRequest
          .withArgs({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex })
          .throws(new Error())
        try {
          await Cache.getEndpointAndRender(
            Config.ENDPOINT_SOURCE_URL,
            fsp,
            endpointType
          )
          test.fail('should throw error')
          await Cache.stopCache()
          test.end()
        } catch (e) {
          test.ok(e instanceof Error)
          await Cache.stopCache()
          test.end()
        }
      })

      await getEndpointAndRenderTest.end()
    }
  )

  cacheTest.test('initializeCache should', async (initializeCacheTest) => {
    initializeCacheTest.test(
      'initializeCache cache and return true',
      async (test) => {
        try {
          const result = await Cache.initializeCache(
            Config.ENDPOINT_CACHE_CONFIG,
            { hubName, hubNameRegex }
          )
          test.equal(result, true, 'The results match')
          await Cache.stopCache()
          test.end()
        } catch (err) {
          test.fail('Error thrown', err)
          test.end()
        }
      }
    )

    initializeCacheTest.test('should throw error', async (test) => {
      try {
        sandbox.stub(Catbox, 'Client').throws(new Error())
        await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG, { hubName, hubNameRegex })
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
