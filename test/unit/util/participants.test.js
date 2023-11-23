'use strict'

const Test = require('tapes')(require('tape'))
const src = '../../../src'
const Sinon = require('sinon')
const Cache = require(`${src}/util/participants`)
const request = require(`${src}/util/request`)
const Catbox = require('@hapi/catbox')
const Config = require('../../util/config')
const Http = require(`${src}/util`).Http
const Enum = require(`${src}`).Enum
const Mustache = require('mustache')
const Helper = require('../../util/helper')
const Logger = require('@mojaloop/central-services-logger')
const Metrics = require('@mojaloop/central-services-metrics')

Test('Participants Cache Test', participantsCacheTest => {
  let sandbox

  participantsCacheTest.beforeEach(async test => {
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

  participantsCacheTest.afterEach(async test => {
    sandbox.restore()
    test.end()
  })

  participantsCacheTest.test('getParticipant should', async (getParticipantTest) => {
    getParticipantTest.test('return the participant', async (test) => {
      const fsp = 'fsp2'
      const expectedName = 'fsp2'
      const url = Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANTS_POST)
      await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG)
      request.sendRequest.withArgs(url, Helper.defaultHeaders()).returns(Promise.resolve(Helper.getParticipantsResponse))

      try {
        const result = await Cache.getParticipant(Config.ENDPOINT_SOURCE_URL, fsp)
        test.equal(result.name, expectedName, 'The results match')
        await Cache.stopCache()
        test.end()
      } catch (err) {
        test.fail('Error thrown', err)
        test.end()
      }
    })

    getParticipantTest.test('return the participant if catbox returns decoratedValue object', async (test) => {
      const fsp = 'fsp2'
      const expectedName = 'fsp2'
      const url = Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANTS_POST)
      await Cache.initializeCache({
        ...Config.ENDPOINT_CACHE_CONFIG,
        getDecoratedValue: true
      })
      request.sendRequest.withArgs(url, Helper.defaultHeaders()).returns(Promise.resolve(Helper.getParticipantsResponse))

      try {
        const result = await Cache.getParticipant(Config.ENDPOINT_SOURCE_URL, fsp)
        test.equal(result.name, expectedName, 'The results match')
        await Cache.stopCache()
        test.end()
      } catch (err) {
        test.fail('Error thrown', err)
        test.end()
      }
    })

    getParticipantTest.test('return throw an error if array not returned in response object', async (test) => {
      const fsp = 'fsp2'
      const url = Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANTS_POST)
      await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG)
      request.sendRequest.withArgs(url, Helper.defaultHeaders()).returns(Promise.resolve({ data: {} }))

      try {
        const participant = await Cache.getParticipant(Config.ENDPOINT_SOURCE_URL, fsp)
        console.log(participant)
        test.fail('should throw error')
        await Cache.stopCache()
        test.end()
      } catch (err) {
        test.ok(err instanceof Error)
        await Cache.stopCache()
        test.end()
      }
    })

    getParticipantTest.test('throw error', async (test) => {
      const fsp = 'fsp2'
      const url = Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANTS_POST)
      await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG)
      request.sendRequest.withArgs(url, Helper.defaultHeaders()).throws(new Error())

      try {
        const participant = await Cache.getParticipant(Config.ENDPOINT_SOURCE_URL, fsp)
        console.log(participant)
        test.fail('should throw error')
        await Cache.stopCache()
        test.end()
      } catch (err) {
        test.ok(err instanceof Error)
        await Cache.stopCache()
        test.end()
      }
    })
    await getParticipantTest.end()
  })

  participantsCacheTest.test('initializeCache should', async (participantsInitializeCacheTest) => {
    participantsInitializeCacheTest.test('initializeCache cache and return true', async (test) => {
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

    participantsInitializeCacheTest.test('should throw error', async (test) => {
      try {
        sandbox.stub(Catbox, 'Client').throws(new Error())
        await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG)
        test.fail('should throw')
        test.end()
      } catch (err) {
        test.ok(err instanceof Error)
        test.end()
      }
    })

    await participantsInitializeCacheTest.end()
  })
  participantsCacheTest.end()
})
