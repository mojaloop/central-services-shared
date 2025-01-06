/*****
 License
 --------------
 Copyright © 2020-2024 Mojaloop Foundation
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
 - Name Surname <name.surname@mojaloop.io>
 * Infitx
 - Kevin Leyow <kevin.leyow@infitx.com>
 --------------
 ******/

const Test = require('tapes')(require('tape'))
const sinon = require('sinon')
const rethrow = require('../../../src/util/rethrow')
const ErrorHandler = require('@mojaloop/central-services-error-handling')

Test('rethrow.js', rethrowTest => {
  let sandbox

  rethrowTest.beforeEach(t => {
    sandbox = sinon.createSandbox()
    sandbox.stub(ErrorHandler.Factory, 'reformatFSPIOPError')
    t.end()
  })

  rethrowTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  rethrowTest.test('rethrowAndCountFspiopError should log the error and rethrow a reformatted FSPIOP error', t => {
    const error = new Error('Test error')
    const fspiopError = new Error('FSPIOP error')
    ErrorHandler.Factory.reformatFSPIOPError.returns(fspiopError)

    try {
      rethrow.rethrowAndCountFspiopError(error)
      t.fail('Expected error to be thrown')
    } catch (err) {
      t.equal(err, fspiopError, 'Error rethrown correctly')
    }
    t.end()
  })

  rethrowTest.test('rethrowAndCountFspiopError should increment the error counter with correct labels', t => {
    const error = new Error('Test error')
    const fspiopError = {
      apiErrorCode: { code: '1234' },
      extensions: [{ key: 'system', value: 'testSystem' }]
    }
    ErrorHandler.Factory.reformatFSPIOPError.returns(fspiopError)

    try {
      rethrow.rethrowAndCountFspiopError(error, { operation: 'testOp', step: 'testStep' })
      t.fail('Expected error to be thrown')
    } catch (err) {
      t.equal(err, fspiopError, 'Error rethrown correctly')
    }
    t.end()
  })

  rethrowTest.test('rethrowDatabaseError should rethrow a database error', t => {
    const error = new Error('Database error')
    const systemError = new Error('System error')
    ErrorHandler.Factory.reformatFSPIOPError.returns(systemError)

    try {
      rethrow.rethrowDatabaseError(error)
      t.fail('Expected error to be thrown')
    } catch (err) {
      t.equal(err, systemError, 'Error rethrown correctly')
    }
    t.end()
  })

  rethrowTest.test('rethrowCachedDatabaseError should rethrow a cached database error', t => {
    const error = new Error('Cached database error')
    const systemError = new Error('System error')
    ErrorHandler.Factory.reformatFSPIOPError.returns(systemError)

    try {
      rethrow.rethrowCachedDatabaseError(error)
      t.fail('Expected error to be thrown')
    } catch (err) {
      t.equal(err, systemError, 'Error rethrown correctly')
    }
    t.end()
  })

  rethrowTest.test('rethrowRedisError should rethrow a redis error', t => {
    const error = new Error('Redis error')
    const systemError = new Error('System error')
    ErrorHandler.Factory.reformatFSPIOPError.returns(systemError)

    try {
      rethrow.rethrowRedisError(error)
      t.fail('Expected error to be thrown')
    } catch (err) {
      t.equal(err, systemError, 'Error rethrown correctly')
    }
    t.end()
  })

  rethrowTest.test('rethrowKafkaError should rethrow a kafka error', t => {
    const error = new Error('Kafka error')
    const systemError = new Error('System error')
    ErrorHandler.Factory.reformatFSPIOPError.returns(systemError)

    try {
      rethrow.rethrowKafkaError(error)
      t.fail('Expected error to be thrown')
    } catch (err) {
      t.equal(err, systemError, 'Error rethrown correctly')
    }
    t.end()
  })

  rethrowTest.test('rethrowCacheError should rethrow a cache error', t => {
    const error = new Error('Cache error')
    const systemError = new Error('System error')
    ErrorHandler.Factory.reformatFSPIOPError.returns(systemError)

    try {
      rethrow.rethrowCacheError(error)
      t.fail('Expected error to be thrown')
    } catch (err) {
      t.equal(err, systemError, 'Error rethrown correctly')
    }
    t.end()
  })

  rethrowTest.end()
})
