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

Test('ParticipantEndpoint Model Test', modelTest => {
  let sandbox
  let request
  let Model
  const hubName = 'Hub'
  const hubNameRegex = /^Hub$/i

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
    // Factory for creating spans with common setup
    const createSpan = (overrides = {}) => {
      const spanFinishStub = sandbox.stub()
      const spanAuditStub = sandbox.stub()
      const spanErrorStub = sandbox.stub()
      const sendRequestSpan = {
        setTags: sandbox.stub(),
        finish: spanFinishStub,
        error: spanErrorStub,
        ...overrides.sendRequestSpan
      }
      return {
        span: {
          getChild: sandbox.stub().returns(sendRequestSpan),
          getContext: sandbox.stub().returns({ service: 'test' }),
          injectContextToHttpRequest: sandbox.stub(requestOptions => requestOptions),
          audit: spanAuditStub,
          ...overrides.span
        },
        stubs: { spanFinishStub, spanAuditStub, spanErrorStub, sendRequestSpan }
      }
    }

    // Factory for creating request options
    const createRequestOptions = (fsp = 'fsp1', method = 'get') => ({
      url: Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET, { fsp }),
      method
    })

    // Generic sendRequest caller
    const callSendRequest = async (options = {}) => {
      const { url, headers, source = hubName, destination = hubName, ...rest } = options
      return Model.sendRequest({
        url: url || createRequestOptions().url,
        headers: headers || Helper.defaultHeaders(hubName, Enum.Http.HeaderResources.PARTICIPANTS, hubName),
        source,
        destination,
        hubNameRegex,
        ...rest
      })
    }

    // Helper function to test error handling scenarios
    const testErrorHandling = async (test, errorConfig, expectations) => {
      const { fsp = 'fsp1', errorMessage, errorCode, responseData } = errorConfig
      const customError = new Error(errorMessage)
      customError.code = errorCode
      if (responseData) customError.response = responseData

      request = sandbox.stub().throws(customError)
      Model = proxyquire('../../../src/util/request', { axios: request })

      try {
        await callSendRequest({ url: createRequestOptions(fsp).url })
        test.fail('should throw error')
      } catch (e) {
        test.ok(e instanceof Error, 'Error was thrown')
        Object.entries(expectations).forEach(([key, value]) => {
          if (key === 'notEqual') {
            test.notEqual(e.apiErrorCode.code, value.code, value.message)
          } else if (key === 'apiErrorCode') {
            test.equal(e.apiErrorCode.code, value, expectations.apiErrorCodeMessage || 'Error code matches expected')
          } else if (key === 'message') {
            test.equal(e.message, value, expectations.messageDescription || 'Error message matches expected')
          }
        })
      }
      test.end()
    }

    // Helper function to test span string payload handling
    const testSpanStringPayload = async (test, payloadStr, expectedPayload, description) => {
      const { span, stubs } = createSpan()
      request = sandbox.stub().returns(Helper.getEndPointsResponse)
      Model = proxyquire('../../../src/util/request', { axios: request })

      await callSendRequest({ method: 'post', payload: payloadStr, span })

      test.ok(stubs.spanAuditStub.calledOnce, 'Span audit is called')
      const auditCallArgs = stubs.spanAuditStub.getCall(0).args[0]
      const assertion = typeof expectedPayload === 'object' ? 'deepEqual' : 'equal'
      test[assertion](auditCallArgs.payload, expectedPayload, description)
      test.end()
    }

    // Helper function to test error handling with span
    const testErrorWithSpan = async (test, errorConfig, expectedCode) => {
      const { span, stubs } = createSpan()
      request = sandbox.stub().throws(errorConfig)
      Model = proxyquire('../../../src/util/request', { axios: request })

      try {
        await callSendRequest({ span })
        test.fail('should throw error')
      } catch (e) {
        test.ok(stubs.spanErrorStub.called, 'Span error is called')
        test.ok(stubs.spanFinishStub.called, 'Span finish is called')
        if (stubs.spanErrorStub.callCount > 0) {
          const errorArg = stubs.spanErrorStub.getCall(0).args[0]
          test.equal(errorArg.apiErrorCode.code, expectedCode, `Error code ${expectedCode} passed to span`)
        }
      }
      test.end()
    }

    getEndpointTest.test('return the object of endpoints', async (test) => {
      const fsp = 'fsp'
      const requestOptions = {
        url: Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET, { fsp }),
        method: 'get'
      }
      request = sandbox.stub().returns(Helper.getEndPointsResponse)
      Model = proxyquire('../../../src/util/request', { axios: request })

      try {
        const result = await Model.sendRequest({
          url: requestOptions.url,
          headers: Helper.defaultHeaders(hubName, Enum.Http.HeaderResources.PARTICIPANTS, hubName),
          source: hubName,
          destination: hubName,
          hubNameRegex
        })
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
        const result = await Model.sendRequest({
          url: requestOptions.url,
          headers: Helper.defaultHeaders(hubName, Enum.Http.HeaderResources.PARTICIPANTS, hubName),
          source: hubName,
          destination: hubName,
          method: Enum.Http.RestMethods.GET,
          responseType: Enum.Http.ResponseTypes.JSON,
          span,
          hubNameRegex
        })
        test.deepEqual(result, Helper.getEndPointsResponse, 'The results match')
        test.end()
      } catch (err) {
        test.fail('Error thrown', err)
        test.end()
      }
    })

    getEndpointTest.test('handle protocolVersions for config injection', async (test) => {
      const protocolVersions = {
        content: '2.1',
        accept: '2'
      }
      const fsp = 'fsp'
      const requestOptions = {
        url: Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET, { fsp }),
        method: 'get'
      }
      const requestFunction = (request) => {
        test.equal(request.headers['content-type'], Helper.generateProtocolHeader('participants', protocolVersions.content))
        test.equal(request.headers.accept, Helper.generateProtocolHeader('participants', protocolVersions.accept))
        return Helper.getEndPointsResponse
      }
      const span = EventSdk.Tracer.createSpan('test-span')
      Model = proxyquire('../../../src/util/request', { axios: requestFunction })

      try {
        const result = await Model.sendRequest({
          url: requestOptions.url,
          headers: Helper.defaultHeaders(hubName, Enum.Http.HeaderResources.PARTICIPANTS, hubName),
          source: hubName,
          destination: hubName,
          method: Enum.Http.RestMethods.GET,
          responseType: Enum.Http.ResponseTypes.JSON,
          span,
          jwsSigner: null,
          protocolVersions,
          hubNameRegex
        })
        test.deepEqual(result, Helper.getEndPointsResponse, 'The results match')
        test.end()
      } catch (err) {
        test.fail('Error thrown', err)
        test.end()
      }
    })

    getEndpointTest.test('handle protocolVersions without config injection', async (test) => {
      const protocolVersions = null
      const fsp = 'fsp'
      const requestOptions = {
        url: Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET, { fsp }),
        method: 'get'
      }
      const requestFunction = (request) => {
        test.equal(request.headers['content-type'], Helper.generateProtocolHeader('participants', '1.0'))
        test.equal(request.headers.accept, Helper.generateProtocolHeader('participants', '1'))
        return Helper.getEndPointsResponse
      }
      const span = EventSdk.Tracer.createSpan('test-span')
      Model = proxyquire('../../../src/util/request', { axios: requestFunction })

      try {
        const result = await Model.sendRequest({
          url: requestOptions.url,
          headers: Helper.defaultHeaders(hubName, Enum.Http.HeaderResources.PARTICIPANTS, hubName),
          source: hubName,
          destination: hubName,
          method: Enum.Http.RestMethods.GET,
          responseType: Enum.Http.ResponseTypes.JSON,
          span,
          jwsSigner: null,
          protocolVersions,
          hubNameRegex
        })
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
        await Model.sendRequest({
          url: requestOptions.url,
          headers: Helper.defaultHeaders(hubName, Enum.Http.HeaderResources.PARTICIPANTS, hubName),
          source: hubName,
          destination: hubName,
          hubNameRegex
        })
        test.fail('should throw error')
        test.end()
      } catch (e) {
        test.ok(e instanceof Error)
        test.ok(request.defaults.httpAgent.toJSON())
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
        await Model.sendRequest({
          url: requestOptions.url,
          headers: Helper.defaultHeaders(hubName, Enum.Http.HeaderResources.PARTICIPANTS, hubName),
          source: hubName,
          destination: hubName,
          hubNameRegex
        })
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
        await Model.sendRequest({
          url: requestOptions.url,
          headers: Helper.defaultHeaders(hubName, Enum.Http.HeaderResources.PARTICIPANTS, hubName),
          source: hubName,
          destination: hubName,
          method: Enum.Http.RestMethods.POST,
          hubNameRegex
        })
        test.fail('should throw error')
        test.end()
      } catch (e) {
        test.ok(e instanceof Error)
        test.end()
      }
    })

    getEndpointTest.test('preserve 400 error with errorInformation from downstream service', async (test) => {
      await testErrorHandling(test, {
        fsp: 'nonexistentfsp',
        errorMessage: 'Request failed with status code 400',
        errorCode: 'ERR_BAD_REQUEST',
        responseData: {
          status: 400,
          data: {
            errorInformation: {
              errorCode: '3200',
              errorDescription: 'FSP not found'
            }
          }
        }
      }, {
        apiErrorCode: '3200',
        apiErrorCodeMessage: 'Error code is preserved from errorInformation',
        message: 'FSP not found',
        messageDescription: 'Error message is preserved from errorInformation',
        notEqual: { code: '1001', message: 'Error is not converted to DESTINATION_COMMUNICATION_ERROR' }
      })
    })

    getEndpointTest.test('handle 404 error without errorInformation', async (test) => {
      await testErrorHandling(test, {
        fsp: 'notfound',
        errorMessage: 'Request failed with status code 404',
        errorCode: 'ERR_BAD_REQUEST',
        responseData: {
          status: 404,
          data: {
            message: 'Resource not found'
          }
        }
      }, {
        apiErrorCode: '3200',
        apiErrorCodeMessage: 'Error code is ID_NOT_FOUND for 404',
        message: 'Resource not found',
        messageDescription: 'Error message is preserved',
        notEqual: { code: '1001', message: 'Error is not converted to DESTINATION_COMMUNICATION_ERROR' }
      })
    })

    getEndpointTest.test('handle network error as DESTINATION_COMMUNICATION_ERROR', async (test) => {
      await testErrorHandling(test, {
        errorMessage: 'ECONNREFUSED',
        errorCode: 'ECONNREFUSED'
        // No response property for network errors
      }, {
        apiErrorCode: '1001',
        apiErrorCodeMessage: 'Network error is converted to DESTINATION_COMMUNICATION_ERROR',
        message: 'Failed to send HTTP request to host',
        messageDescription: 'Generic error message for network errors'
      })
    })

    getEndpointTest.test('handle 500 error as DESTINATION_COMMUNICATION_ERROR', async (test) => {
      await testErrorHandling(test, {
        errorMessage: 'Request failed with status code 500',
        errorCode: 'ERR_BAD_RESPONSE',
        responseData: {
          status: 500,
          data: {
            message: 'Internal Server Error'
          }
        }
      }, {
        apiErrorCode: '1001',
        apiErrorCodeMessage: '5xx error is converted to DESTINATION_COMMUNICATION_ERROR',
        message: 'Failed to send HTTP request to host',
        messageDescription: 'Generic error message for server errors'
      })
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
      const jwsSigner = {
        getSignature: () => 'mock-jws-signature'
      }
      request = sandbox.stub().returns({ status: 200 })
      Model = proxyquire('../../../src/util/request', { axios: request })
      const signSpy = Sinon.spy(jwsSigner, 'getSignature')
      await Model.sendRequest({
        url: requestOptions.url,
        headers: requestOptions.headers,
        source: hubName,
        destination: fsp,
        method: requestOptions.method,
        payload,
        responseType: Enum.Http.ResponseTypes.JSON,
        jwsSigner,
        hubNameRegex
      })
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
      const jwsSigner = {
        getSignature: () => 'mock-jws-signature'
      }
      request = sandbox.stub().returns({ status: 200 })
      Model = proxyquire('../../../src/util/request', { axios: request })
      const signSpy = Sinon.spy(jwsSigner, 'getSignature')
      await Model.sendRequest({
        url: requestOptions.url,
        headers: requestOptions.headers,
        source: hubName,
        destination: fsp,
        method: requestOptions.method,
        payload,
        responseType: Enum.Http.ResponseTypes.JSON,
        hubNameRegex
      })
      test.equal(signSpy.callCount, 0, 'JwsSigner.sign is NOT called')
      test.end()
    })

    getEndpointTest.test('handle span with string payload that can be parsed as JSON', async (test) => {
      await testSpanStringPayload(test, '{"test": "data"}', { test: 'data' }, 'String payload is parsed to JSON for audit')
    })

    getEndpointTest.test('handle span with string payload that cannot be parsed as JSON', async (test) => {
      await testSpanStringPayload(test, 'not valid json', 'not valid json', 'String payload remains as string when not parseable')
    })

    getEndpointTest.test('handle 403 error without errorInformation', async (test) => {
      await testErrorHandling(test, {
        fsp: 'forbidden',
        errorMessage: 'Request failed with status code 403',
        responseData: {
          status: 403,
          data: { message: 'You do not have permission' }
        }
      }, {
        apiErrorCode: '3000',
        message: 'You do not have permission'
      })
    })

    getEndpointTest.test('handle 400 error without errorInformation and without message', async (test) => {
      await testErrorHandling(test, {
        fsp: 'badrequest',
        errorMessage: 'Request failed with status code 400',
        responseData: {
          status: 400,
          data: {}
        }
      }, {
        apiErrorCode: '3000',
        message: 'Bad Request'
      })
    })

    getEndpointTest.test('handle error with errorInformation and span', async (test) => {
      const customError = new Error('Request failed with status code 400')
      customError.response = {
        status: 400,
        data: {
          errorInformation: {
            errorCode: '3200',
            errorDescription: 'FSP not found'
          }
        }
      }
      await testErrorWithSpan(test, customError, '3200')
    })

    getEndpointTest.test('handle 4xx error without errorInformation and with span', async (test) => {
      const customError = new Error('Request failed with status code 403')
      customError.response = {
        status: 403,
        data: { message: 'Forbidden' }
      }
      await testErrorWithSpan(test, customError, '3000')
    })

    getEndpointTest.test('handle network error with span', async (test) => {
      const customError = new Error('ECONNREFUSED')
      customError.code = 'ECONNREFUSED'
      await testErrorWithSpan(test, customError, '1001')
    })

    getEndpointTest.test('should use default httpRequestTimeoutMs from config', async (test) => {
      // Arrange
      const fsp = 'fsp'
      const requestOptions = {
        url: Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET, { fsp }),
        method: 'get'
      }
      let receivedOptions
      request = sandbox.stub().callsFake((options) => {
        receivedOptions = options
        return Helper.getEndPointsResponse
      })
      Model = proxyquire('../../../src/util/request', { axios: request })

      // Act
      await Model.sendRequest({
        url: requestOptions.url,
        headers: Helper.defaultHeaders(hubName, Enum.Http.HeaderResources.PARTICIPANTS, hubName),
        source: hubName,
        destination: hubName,
        hubNameRegex
      })

      // Assert
      test.equal(receivedOptions.timeout, require('../../../src/config').get('httpRequestTimeoutMs'), 'Timeout is set from config')
      test.end()
    })

    getEndpointTest.test('should allow overriding httpRequestTimeoutMs via axiosRequestOptionsOverride', async (test) => {
      // Arrange
      const fsp = 'fsp'
      const overrideTimeout = 12345
      let receivedTimeout
      const requestFunction = (requestOptions) => {
        receivedTimeout = requestOptions.timeout
        return Helper.getEndPointsResponse
      }
      Model = proxyquire('../../../src/util/request', { axios: requestFunction })

      // Act
      await Model.sendRequest({
        url: Mustache.render(Config.ENDPOINT_SOURCE_URL + Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET, { fsp }),
        headers: Helper.defaultHeaders(hubName, Enum.Http.HeaderResources.PARTICIPANTS, hubName),
        source: hubName,
        destination: hubName,
        hubNameRegex,
        axiosRequestOptionsOverride: { timeout: overrideTimeout }
      })

      // Assert
      test.equal(receivedTimeout, overrideTimeout, 'Timeout is overridden by axiosRequestOptionsOverride')
      test.end()
    })

    getEndpointTest.end()
  })

  modelTest.end()
})
