'use strict'

const EventSdk = require('@mojaloop/event-sdk')
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Config = require('../../util/config')
const Mustache = require('mustache')
const proxyquire = require('proxyquire')
const Enum = require('../../../src/enums')
const Helper = require('../../util/helper')
const Metrics = require('@mojaloop/central-services-metrics')
const Uuid = require('uuid4')
const JwsSigner = require('@mojaloop/sdk-standard-components').Jws.signer

const signingKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0eJEh3Op5p6x137lRkAsvmEBbd32dbRChrCUItZbtxjf/qfB
yD5k8Hn4n4vbqzP8XSGS0f6KmNC+iRaP74HVgzAqc4Uid4J8dtSBq3VmucYQYzLc
101QjuvD+SKmZwlw/q0PtulmqlASI2SbMfwcAraMi6ab7v5W4EGNeIPLEIo3BXsQ
DTCWqiZb7aXkHkcY7sOjAzK/2bNGYFmAthdYrHzvCkqnJ7LAHX3Oj7rJea5MqtuN
B9POZYaD10n9JuYWdwPqLrw6/hVgPSFEy+ulrVbXf54ZH0dfMThAYRvFrT81yulk
H95JhXWGdi6cTp6t8LVOKFhnNfxjWw0Jayj9xwIDAQABAoIBADB2u/Y/CgNbr5sg
DRccqHhJdAgHkep59kadrYch0knEL6zg1clERxCUSYmlxNKSjXp/zyQ4T46b3PNQ
x2m5pDDHxXWpT10jP1Q9G7gYwuCw0IXnb8EzdB+cZ0M28g+myXW1RoSo/nDjTlzn
1UJEgb9Kocd5cFZOWocr+9vRKumlZULMsA8yiNwlAfJHcMBM7acsa3myCqVhLyWt
4BQylVuLFa+A6QzpMXEwFCq8EOXf07gl1XVzC6LJ1fTa9gVM3N+YE+oEXKrsHCxG
/ACgKsjepL27QjJ7qvecWPP0F2LxEZYOm5tbXaKJTobzQUJHgUokanZMhjYprDsZ
zumLw9kCgYEA/DUWcnLeImlfq/EYdhejkl3J+WX3vhS23OqVgY1amu7CZzaai6vt
H0TRc8Zsbi4jgmFDU8PFzytP6qz6Tgom4R736z6oBi7bjnGyN17/NSbf+DaRVcM6
vnZr7jNC2FJlECmIN+dkwUA/YCr2SA7hxZXM9mIYSc+6+glDiIO5Cf0CgYEA1Qo/
uQbVHhW+Cp8H0kdMuhwUbkBquRrxRZlXS1Vrf3f9me9JLUy9UPWb3y3sKVurG5+O
SIlr4hDcZyXdE198MtDMhBIGqU9ORSjppJDNDVvtt+n2FD4XmWIU70vKBJBivX0+
Bow6yduis+p12fuvpvpnKCz8UjOgOQJhLZ4GQBMCgYBP6gpozVjxkm4ML2LO2IKt
+CXtbo/nnOysZ3BkEoQpH4pd5gFmTF3gUJAFnVPyPZBm2abZvejJ0jGKbLELVVAo
eQWZdssK2oIbSo9r2CAJmX3SSogWorvUafWdDoUZwlHfoylUfW+BhHgQYsyS3JRR
ZTwCveZwTPA0FgdeFE7niQKBgQCHaD8+ZFhbCejDqXb4MXdUJ3rY5Lqwsq491YwF
huKPn32iNNQnJcqCxclv3iln1Cr6oLx34Fig1KSyLv/IS32OcuY635Y6UPznumxe
u+aJIjADIILXNOwdAplZy6s4oWkRFaSx1rmbCa3tew2zImTv1eJxR76MpOGmupt3
uiQw3wKBgFjBT/aVKdBeHeP1rIHHldQV5QQxZNkc6D3qn/oAFcwpj9vcGfRjQWjO
ARzXM2vUWEet4OVn3DXyOdaWFR1ppehz7rAWBiPgsMg4fjAusYb9Mft1GMxMzuwT
Oyqsp6pzAWFrCD3JAoTLxClV+j5m+SXZ/ItD6ziGpl/h7DyayrFZ
-----END RSA PRIVATE KEY-----`

Test('ParticipantEndpoint Model Test', modelTest => {
  let sandbox
  let request
  let Model
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

  modelTest.beforeEach(test => {
    sandbox = Sinon.createSandbox()
    test.end()
  })

  modelTest.afterEach(test => {
    sandbox.restore()
    test.end()
  })

  modelTest.test('sendRequest should', async (getEndpointTest) => {
    getEndpointTest.test('return the object of endpoints', async (test) => {
      const fsp = 'fsp'
      const requestOptions = {
        url: Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET, { fsp }),
        method: 'get'
      }
      request = sandbox.stub().returns(Helper.getEndPointsResponse)
      Model = proxyquire('../../../src/util/request', { axios: request })

      try {
        const result = await Model.sendRequest(requestOptions.url, Helper.defaultHeaders(Enum.Http.HeaderResources.SWITCH, Enum.Http.HeaderResources.PARTICIPANTS, Enum.Http.HeaderResources.SWITCH), Enum.Http.HeaderResources.SWITCH, Enum.Http.HeaderResources.SWITCH)
        test.deepEqual(result, Helper.getEndPointsResponse, 'The results match')
        test.end()
      } catch (err) {
        test.fail('Error thrown', err)
        test.end()
      }
    })

    getEndpointTest.test('handle a span and add traceparent header', async (test) => {
      const fsp = 'fsp'
      const requestOptions = {
        url: Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET, { fsp }),
        method: 'get'
      }
      const requestFunction = (request) => {
        test.ok(request.headers.traceparent)
        return Helper.getEndPointsResponse
      }
      const span = EventSdk.Tracer.createSpan('test-span')
      Model = proxyquire('../../../src/util/request', { axios: requestFunction })

      try {
        const result = await Model.sendRequest(requestOptions.url, Helper.defaultHeaders(Enum.Http.HeaderResources.SWITCH, Enum.Http.HeaderResources.PARTICIPANTS, Enum.Http.HeaderResources.SWITCH), Enum.Http.HeaderResources.SWITCH, Enum.Http.HeaderResources.SWITCH, Enum.Http.RestMethods.GET, undefined, Enum.Http.ResponseTypes.JSON, span)
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
        await Model.sendRequest(requestOptions.url, Helper.defaultHeaders(Enum.Http.HeaderResources.SWITCH, Enum.Http.HeaderResources.PARTICIPANTS, Enum.Http.HeaderResources.SWITCH), Enum.Http.HeaderResources.SWITCH, Enum.Http.HeaderResources.SWITCH)
        test.fail('should throw error')
        test.end()
      } catch (e) {
        test.ok(e instanceof Error)
        test.end()
      }
    })

    getEndpointTest.test('throw error when error contains response property', async (test) => {
      const fsp = 'fsp1'

      const requestOptions = {
        url: Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET, { fsp }),
        method: 'get'
      }

      const customError = new Error()
      customError.response = {
        status: 'status',
        data: 'data'
      }
      request = sandbox.stub().throws(customError)
      Model = proxyquire('../../../src/util/request', { axios: request })

      try {
        await Model.sendRequest(requestOptions.url, Helper.defaultHeaders(Enum.Http.HeaderResources.SWITCH, Enum.Http.HeaderResources.PARTICIPANTS, Enum.Http.HeaderResources.SWITCH), Enum.Http.HeaderResources.SWITCH, Enum.Http.HeaderResources.SWITCH)
        test.fail('should throw error')
        test.end()
      } catch (e) {
        test.ok(e instanceof Error)
        test.end()
      }
    })

    getEndpointTest.test('throw error when required parameter is missing', async (test) => {
      const fsp = 'fsp1'

      const requestOptions = {
        url: Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.TRANSACTION_REQUEST_POST, { fsp }),
        method: 'post'
      }

      request = sandbox.stub().throws(new Error())
      Model = proxyquire('../../../src/util/request', { axios: request })

      try {
        await Model.sendRequest(requestOptions.url, Helper.defaultHeaders(Enum.Http.HeaderResources.SWITCH, Enum.Http.HeaderResources.PARTICIPANTS, Enum.Http.HeaderResources.SWITCH), Enum.Http.HeaderResources.SWITCH, Enum.Http.HeaderResources.SWITCH, Enum.Http.RestMethods.POST)
        test.fail('should throw error')
        test.end()
      } catch (e) {
        test.ok(e instanceof Error)
        test.end()
      }
    })

    getEndpointTest.test('sign with JWS signature when JwsSigner object is passed', async (test) => {
      const fsp = 'payerfsp'
      const payeefsp = 'payeefsp'
      const ID = Uuid()
      const body = { errorInformation: { errorCode: 3106, errorDescription: 'Modified request' } }
      const payload = JSON.stringify(body)
      const requestOptions = {
        url: Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.TRANSFERS_PUT_ERROR, { fsp, ID }),
        method: 'post',
        headers: Helper.defaultHeaders(fsp, Enum.Http.HeaderResources.PARTICIPANTS, payeefsp)
      }
      const jwsSigner = new JwsSigner({
        logger: null,
        signingKey
      })
      request = sandbox.stub().returns({ status: 200 })
      Model = proxyquire('../../../src/util/request', { axios: request })
      const signSpy = Sinon.spy(jwsSigner, 'getSignature')
      await Model.sendRequest(requestOptions.url, requestOptions.headers, Enum.Http.HeaderResources.SWITCH, fsp, requestOptions.method, payload, Enum.Http.ResponseTypes.JSON, undefined, jwsSigner)
      test.ok(signSpy.calledOnce, 'JwsSigner.sign is called once')
      test.ok('fspiop-signature' in signSpy.getCall(0).firstArg.headers, 'The header has fspiop-signature')
      test.end()
    })

    getEndpointTest.test('NOT sign with JWS signature when JwsSigner object is NOT passed', async (test) => {
      const fsp = 'payerfsp'
      const payeefsp = 'payeefsp'
      const ID = Uuid()
      const body = { errorInformation: { errorCode: 3106, errorDescription: 'Modified request' } }
      const payload = JSON.stringify(body)
      const requestOptions = {
        url: Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.TRANSFERS_PUT_ERROR, { fsp, ID }),
        method: 'post',
        headers: Helper.defaultHeaders(fsp, Enum.Http.HeaderResources.PARTICIPANTS, payeefsp)
      }
      const jwsSigner = new JwsSigner({
        logger: null,
        signingKey
      })
      request = sandbox.stub().returns({ status: 200 })
      Model = proxyquire('../../../src/util/request', { axios: request })
      const signSpy = Sinon.spy(jwsSigner, 'getSignature')
      await Model.sendRequest(requestOptions.url, requestOptions.headers, Enum.Http.HeaderResources.SWITCH, fsp, requestOptions.method, payload, Enum.Http.ResponseTypes.JSON, undefined, undefined)
      test.equal(signSpy.callCount, 0, 'JwsSigner.sign is NOT called')
      test.end()
    })

    getEndpointTest.end()
  })

  modelTest.end()
})
