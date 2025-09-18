const Test = require('tapes')(require('tape'))
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const { Http } = require('../../src/enums')

Test('sendRequest Tests -->', test => {
  let sandbox
  let axios
  let axiosRetry
  let request

  test.beforeEach(t => {
    sandbox = sinon.createSandbox()
    axios = sandbox.stub()
    axiosRetry = { default: sandbox.stub() }
    request = proxyquire('../../src/util/request', { axios, 'axios-retry': axiosRetry })
    // sinon can't mock such way of using axios: axios(requestOptions)
    t.end()
  })

  test.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  test.test('should add fspiop-signature header if jwsSigner is passed ', async test => {
    const signature = 'signature'
    const jwsSigner = {
      getSignature: sandbox.stub().callsFake(() => signature)
    }

    await request.sendRequest({
      url: 'http://localhost:1234',
      jwsSigner,
      headers: {
        [Http.Headers.FSPIOP.SOURCE]: 'source'
      },
      source: 'source',
      destination: 'destination',
      hubNameRegex: 'hubNameRegex'
    })

    test.ok(axios.calledOnce)
    const { headers } = axios.lastCall.args[0]
    test.equal(headers['fspiop-signature'], signature)
    test.end()
  })

  test.test('HTTP retries Tests -->', (retryTests) => {
    retryTests.test('should not use axiosRetry', (t) => {
      t.false(axiosRetry.default.called, 'axiosRetry is NOT called')
      t.end()
    })

    retryTests.test('should add axiosRetry', (t) => {
      const retries = 3
      process.env.HTTP_RETRY_COUNT = String(retries)
      request = proxyquire('../../src/util/request', { axios, 'axios-retry': axiosRetry })
      delete process.env.HTTP_RETRY_COUNT // reset env variable
      t.true(axiosRetry.default.calledOnce, 'axiosRetry is called')
      t.equal(axiosRetry.default.lastCall.args[1].retries, retries, 'axiosRetry is called with retries')
      t.end()
    })

    retryTests.end()
  })

  test.end()
})
