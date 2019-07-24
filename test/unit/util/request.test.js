'use strict'

const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Config = require('../../util/config')
const Mustache = require('mustache')
const proxyquire = require('proxyquire')
const Enum = require('../../../src/enums')
const Helper = require('../../util/helper')

Test('ParticipantEndpoint Model Test', modelTest => {
  let sandbox
  let request
  let Model

  modelTest.beforeEach(test => {
    sandbox = Sinon.createSandbox()
    test.end()
  })

  modelTest.afterEach(test => {
    sandbox.restore()
    test.end()
  })

  modelTest.test('getEndpoint should', async (getEndpointTest) => {
    getEndpointTest.test('return the object of endpoints', async (test) => {
      const fsp = 'fsp'
      const requestOptions = {
        url: Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET, { fsp }),
        method: 'get'
      }
      request = sandbox.stub().returns(Helper.getEndPointsResponse)
      Model = proxyquire('../../../src/util/request', { axios: request })

      try {
        const result = await Model.sendRequest(requestOptions.url, Helper.defaultHeaders(Enum.Http.HeaderResources.SWITCH, Enum.Http.HeaderResources.PARTICIPANTS, Enum.Http.HeaderResources.SWITCH))
        test.deepEqual(result, Helper.getEndPointsResponse, 'The results match')
        test.end()
      } catch (err) {
        test.fail('Error thrown', err)
        test.end()
      }
    })

    getEndpointTest.test('throw error', async (test) => {
      const fsp = 'fsp1'

      const requestOptions = {
        url: Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET, { fsp }),
        method: 'get'
      }

      request = sandbox.stub().throws(new Error())
      Model = proxyquire('../../../src/util/request', { axios: request })

      try {
        await Model.sendRequest(requestOptions.url, Helper.defaultHeaders(Enum.Http.HeaderResources.SWITCH, Enum.Http.HeaderResources.PARTICIPANTS, Enum.Http.HeaderResources.SWITCH))
        test.fail('should throw error')
        test.end()
      } catch (e) {
        test.ok(e instanceof Error)
        test.end()
      }
    })

    getEndpointTest.end()
  })

  modelTest.end()
})
