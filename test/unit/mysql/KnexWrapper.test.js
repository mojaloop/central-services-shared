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

const Tape = require('tapes')(require('tape'))
const sinon = require('sinon')

const { KnexWrapper } = require('#src/mysql/index')
const { logger } = require('#src/logger')
const { tryCatchEndTest } = require('#test/util/helper')

let countIncStub

const mockDeps = ({
  knexOptions = mockKnexOptions(),
  retryOptions = mockRetryOptions(),
  metrics = {
    getCounter: () => ({
      inc: countIncStub
    })
  },
  context = 'testKnexWrapper'
} = {}) => ({
  logger,
  knexOptions,
  metrics,
  retryOptions,
  context
})

const mockKnexOptions = () => ({
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    user: 'root',
    password: '<PASSWORD>',
    database: 'test'
  }
})

const mockRetryOptions = ({
  retries = 1,
  minTimeout = 100
} = {}) => ({ retries, minTimeout })

Tape('KnexWrapper Tests -->', (wrapperTests) => {
  let sandbox

  const mockKnex = ({
    raw = sandbox.stub().resolves({}),
    destroy = sandbox.stub().resolves()
  } = {}) => Object.freeze({ raw, destroy })

  wrapperTests.beforeEach(t => {
    sandbox = sinon.createSandbox()
    countIncStub = sandbox.stub()
    t.end()
  })

  wrapperTests.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  wrapperTests.test('should create an instance', tryCatchEndTest(t => {
    const wrapper = new KnexWrapper(mockDeps())
    t.false(wrapper.isConnected, 'wrapper is not connected')
  }))

  wrapperTests.test('should create an instance with default context', tryCatchEndTest(t => {
    const wrapper = new KnexWrapper(mockDeps({ context: '' }))
    t.true(wrapper.context, 'Knex', 'default context is Knex')
  }))

  wrapperTests.test('should connect from the 2nd attempt', tryCatchEndTest(async t => {
    const wrapper = new KnexWrapper(mockDeps())
    wrapper.knex = mockKnex({
      raw: sandbox.stub()
        .onFirstCall().rejects(new Error('Conn Error'))
        .onSecondCall().resolves({})
    })

    await wrapper.connect()
    t.true(wrapper.isConnected, 'wrapper is connected')
    t.true(countIncStub.notCalled, 'errorCounter is not incremented')
  }))

  wrapperTests.test('should throw connection error, and increment errorCount', tryCatchEndTest(async t => {
    const wrapper = new KnexWrapper(mockDeps())
    wrapper.knex = mockKnex({
      raw: sandbox.stub().rejects(new Error('Conn Error'))
    })

    await wrapper.connect().catch(() => {})
    t.false(wrapper.isConnected, 'wrapper is not connected')
    t.true(countIncStub.calledOnce, 'errorCounter is incremented once')
  }))

  wrapperTests.test('should execute queryFn, and return result', tryCatchEndTest(async t => {
    const wrapper = new KnexWrapper(mockDeps())
    wrapper.knex = mockKnex()
    await wrapper.connect()
    t.true(wrapper.isConnected, 'wrapper is connected')

    const mockResult = [{}]
    const queryFn = sandbox.stub().resolves(mockResult)

    const result = await wrapper.executeWithErrorCount(queryFn)
    t.equal(result, mockResult, 'db result is returned')
    t.equal(queryFn.firstCall.args[0], wrapper.knex, 'knex is passed to queryFn')
  }))

  wrapperTests.test('should rethrow error from queryFn, and increment errorCount', tryCatchEndTest(async t => {
    const wrapper = new KnexWrapper(mockDeps())
    wrapper.knex = mockKnex()
    await wrapper.connect()

    const error = new Error('Query Error')
    const queryFn = sandbox.stub().rejects(error)

    const result = await wrapper.executeWithErrorCount(queryFn, 'op', 'step')
      .catch(err => err)
    t.equal(result, error, 'dbError is rethrown')
    t.true(countIncStub.calledOnce, 'errorCounter is incremented once')
  }))

  wrapperTests.test('should call knex.destroy() on disconnect', tryCatchEndTest(async t => {
    const wrapper = new KnexWrapper(mockDeps())
    wrapper.knex = mockKnex()
    await wrapper.connect()

    await wrapper.disconnect()
    t.false(wrapper.isConnected, 'wrapper is not connected')
    t.true(wrapper.knex.destroy.calledOnce, 'knex.destroy() is called')
  }))

  wrapperTests.test('should return null from handleError, if needRethrow === false', tryCatchEndTest(async t => {
    const wrapper = new KnexWrapper(mockDeps())
    const result = wrapper.handleError(new Error('Test Error'), 'op', 'step', false)
    await wrapper.disconnect()
    t.equal(result, null, 'no error rethrowing')
  }))

  wrapperTests.test('should not throw error if errorCounter.inc() fails', tryCatchEndTest(async t => {
    countIncStub.throws(new Error('Counter Inc Error'))
    const wrapper = new KnexWrapper(mockDeps())
    const result = wrapper.handleError(new Error('Test Error'), undefined, undefined, false)
    t.equal(result, null, 'handleError did not fail')
  }))

  wrapperTests.end()
})
