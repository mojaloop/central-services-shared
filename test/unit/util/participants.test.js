'use strict'

const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Catbox = require('@hapi/catbox')
const Mustache = require('mustache')
const Logger = require('@mojaloop/central-services-logger')
const Metrics = require('@mojaloop/central-services-metrics')
const ErrorHandler = require('@mojaloop/central-services-error-handling')

const Cache = require('#src/util/participants')
const request = require('#src/util/request')
const Http = require('#src/util/http')
const Enum = require('#src/enums/index')

const Config = require('#test/util/config')
const Helper = require('#test/util/helper')

Test('Participants Cache Test', participantsCacheTest => {
  let sandbox
  const hubName = 'Hub'
  const hubNameRegex = /^Hub$/i

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
      const url = Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANTS_GET, { fsp })
      await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG, { hubName, hubNameRegex })
      request.sendRequest.withArgs({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex }).returns(Promise.resolve(Helper.getParticipantsResponseFsp2))

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

    getParticipantTest.test('return the participant without calling request after being cached', async (test) => {
      const fsp = 'fsp2'
      const expectedName = 'fsp2'
      const url = Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANTS_GET, { fsp })
      await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG, { hubName, hubNameRegex })
      request.sendRequest.withArgs({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex }).returns(Promise.resolve(Helper.getParticipantsResponseFsp2))

      try {
        const result = await Cache.getParticipant(Config.ENDPOINT_SOURCE_URL, fsp)
        test.equal(result.name, expectedName, 'The results match')
        test.ok(request.sendRequest.calledOnceWith({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex }), 'Fetch participants was called once')

        const resultCached = await Cache.getParticipant(Config.ENDPOINT_SOURCE_URL, fsp)
        test.equal(request.sendRequest.callCount, 1)
        test.ok(request.sendRequest.calledOnceWith({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex }), 'Fetch participants was not needlessly called')
        test.equal(resultCached.name, expectedName, 'The results match')

        await Cache.stopCache()
        test.end()
      } catch (err) {
        test.fail('Error thrown', err)
        test.end()
      }
    })

    getParticipantTest.test('request fresh participants after invalidating cache', async (test) => {
      const fsp = 'fsp2'
      const expectedName = 'fsp2'
      const url = Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANTS_GET, { fsp })
      await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG, { hubName, hubNameRegex })
      request.sendRequest.withArgs({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex }).returns(Promise.resolve(Helper.getParticipantsResponseFsp2))

      try {
        const result = await Cache.getParticipant(Config.ENDPOINT_SOURCE_URL, fsp)
        test.equal(result.name, expectedName, 'The results match')
        test.ok(request.sendRequest.calledOnceWith({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex }), 'Fetch participants was called once')

        await Cache.invalidateParticipantCache(fsp)

        const resultCached = await Cache.getParticipant(Config.ENDPOINT_SOURCE_URL, fsp)
        test.equal(request.sendRequest.callCount, 2)
        test.ok(request.sendRequest.getCall(1).calledWith({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex }), 'Fetch participants was called again')
        test.equal(resultCached.name, expectedName, 'The results match')

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
      const url = Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANTS_GET, { fsp })
      await Cache.initializeCache({
        ...Config.ENDPOINT_CACHE_CONFIG,
        getDecoratedValue: true
      }, { hubName, hubNameRegex })
      request.sendRequest.withArgs({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex }).returns(Promise.resolve(Helper.getParticipantsResponseFsp2))

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

    getParticipantTest.test('handles error from central-ledger', async (test) => {
      const fsp = 'fsp2'
      const url = Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANTS_GET, { fsp })
      await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG, { hubName, hubNameRegex })
      request.sendRequest.withArgs({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex }).returns(Promise.resolve(Helper.getParticipantsResponseError))

      try {
        await Cache.getParticipant(Config.ENDPOINT_SOURCE_URL, fsp)
        test.fail('should throw error')
        await Cache.stopCache()
        test.end()
      } catch (err) {
        test.ok(err instanceof Error)
        await Cache.stopCache()
        test.end()
      }
    })

    getParticipantTest.test('cache participant even if it was NOT found', async (test) => {
      try {
        const fsp = 'notExists'
        const hubUrl = 'http://hub-url'
        const errorCode = ErrorHandler.Enums.FSPIOPErrorCodes.ID_NOT_FOUND
        const fspiopError = ErrorHandler.Factory.createFSPIOPError(errorCode, 'errorMessage', new Error('Not Found'), 'source', [])
        request.sendRequest.rejects(fspiopError)

        await Cache.initializeCache(Config.PARTICIPANT_CACHE_CONFIG, { hubName, hubNameRegex })

        const result1 = await Cache.getParticipant(hubUrl, fsp)
        test.equal(result1, null, 'participant not exists (1)')
        test.equal(request.sendRequest.callCount, 1)

        const result2 = await Cache.getParticipant(hubUrl, fsp)
        test.equal(result2, null, 'participant not exists (2)')
        test.equal(request.sendRequest.callCount, 1, 'No new request was made')
      } catch (e) {
        test.fail('should not throw error: ' + e.message)
      } finally {
        await Cache.stopCache()
        test.end()
      }
    })

    getParticipantTest.test('throw error', async (test) => {
      const fsp = 'fsp2'
      const url = Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANTS_GET, { fsp })
      await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG, { hubName, hubNameRegex })
      request.sendRequest.withArgs({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex }).throws(new Error())

      try {
        await Cache.getParticipant(Config.ENDPOINT_SOURCE_URL, fsp)
        test.fail('should throw error')
        await Cache.stopCache()
        test.end()
      } catch (err) {
        test.ok(err instanceof Error)
        await Cache.stopCache()
        test.end()
      }
    })

    getParticipantTest.test('throws error if hubName is not defined', async (test) => {
      const fsp = 'fsp2'
      const url = Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANTS_GET, { fsp })
      await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG, { hubNameRegex })
      request.sendRequest.withArgs({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex }).returns(Promise.resolve(Helper.getParticipantsResponseFsp2))

      try {
        await Cache.getParticipant(Config.ENDPOINT_SOURCE_URL, fsp)
        test.fail('should throw error')
        await Cache.stopCache()
        test.end()
      } catch (err) {
        test.ok(err instanceof Error)
        await Cache.stopCache()
        test.end()
      }
    })

    getParticipantTest.test('throws error if hubNameRegex is not defined', async (test) => {
      const fsp = 'fsp2'
      const url = Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANTS_GET, { fsp })
      await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG, { hubName })
      request.sendRequest.withArgs({ url, headers: Helper.defaultHeaders(), source: hubName, destination: hubName, hubNameRegex }).returns(Promise.resolve(Helper.getParticipantsResponseFsp2))

      try {
        await Cache.getParticipant(Config.ENDPOINT_SOURCE_URL, fsp)
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
        const result = await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG, { hubName, hubNameRegex })
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
        await Cache.initializeCache(Config.ENDPOINT_CACHE_CONFIG, { hubName, hubNameRegex })
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
