/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Georgi Georgiev <georgi.georgiev@modusbox.com>
 --------------
 ******/

'use strict'

const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Proxyquire = require('proxyquire')
const Logger = require('@mojaloop/central-services-logger')

Test('Duplicate check comparator', dccTest => {
  let sandbox

  dccTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    t.end()
  })

  dccTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  dccTest.test('duplicateCheckComparator should', duplicateCheckComparatorTest => {
    duplicateCheckComparatorTest.test('compare hashes when id exists', async test => {
      try {
        // Arrange
        const hash = 'helper.hash'
        const duplicateCheckComparator = Proxyquire('#src/util/comparators/duplicateCheckComparator', {
          '../hash': {
            generateSha256: sandbox.stub().returns(hash)
          }
        })
        const id = 1
        const object = { key: 'value' }
        const getDuplicateDataFuncOverride = async (id) => { return Promise.resolve({ id, hash }) }
        const saveHashFuncOverride = sandbox.stub().resolves(true)

        const expected = {
          hasDuplicateId: true,
          hasDuplicateHash: true
        }
        // Act
        const result = await duplicateCheckComparator(id, object, getDuplicateDataFuncOverride, saveHashFuncOverride)

        // Assert
        test.deepEqual(result, expected, 'hash matched')
        test.ok(saveHashFuncOverride.called === false)
        test.end()
      } catch (err) {
        // Assert
        Logger.error(`duplicateCheckComparator failed with error - ${err}`)
        test.fail()
        test.end()
      }
    })

    duplicateCheckComparatorTest.test('save hash when id not found', async test => {
      try {
        // Arrange
        const hash = 'helper.hash'
        const duplicateCheckComparator = Proxyquire('#src/util/comparators/duplicateCheckComparator', {
          '../hash': {
            generateSha256: sandbox.stub().returns(hash)
          }
        })
        const id = 1
        const object = { key: 'value' }
        const getDuplicateDataFuncOverride = async () => { return Promise.resolve(null) }
        const saveHashFuncOverride = sandbox.stub().resolves(true)

        const expected = {
          hasDuplicateId: false,
          hasDuplicateHash: false
        }

        // Act
        const result = await duplicateCheckComparator(id, object, getDuplicateDataFuncOverride, saveHashFuncOverride)

        // Assert
        test.deepEqual(result, expected, 'hash saved')
        test.ok(saveHashFuncOverride.calledOnceWith(id, hash))
        test.end()
      } catch (err) {
        // Assert
        Logger.error(`duplicateCheckComparator failed with error - ${err}`)
        test.fail()
        test.end()
      }
    })

    duplicateCheckComparatorTest.test('compare hashes when id exists and generatedHashOverride is injected', async test => {
      try {
        // Arrange
        const hash = 'helper.hash'
        const generatedHashOverride = 'helper.hash.override'
        const duplicateCheckComparator = Proxyquire('#src/util/comparators/duplicateCheckComparator', {
          '../hash': {
            generateSha256: sandbox.stub().returns(hash)
          }
        })
        const id = 1
        const object = { key: 'value' }
        const getDuplicateDataFuncOverride = async (id) => { return Promise.resolve({ id, hash: generatedHashOverride }) }
        const saveHashFuncOverride = sandbox.stub().resolves(true)

        const expected = {
          hasDuplicateId: true,
          hasDuplicateHash: true
        }

        // Act
        const result = await duplicateCheckComparator(id, object, getDuplicateDataFuncOverride, saveHashFuncOverride, generatedHashOverride)

        // Assert
        test.deepEqual(result, expected, 'hash matched')
        test.ok(saveHashFuncOverride.called === false)
        test.end()
      } catch (err) {
        // Assert
        Logger.error(`duplicateCheckComparator failed with error - ${err}`)
        test.fail()
        test.end()
      }
    })

    duplicateCheckComparatorTest.test('save hash when id not found and generatedHashOverride is injected', async test => {
      try {
        // Arrange
        const hash = 'helper.hash'
        const generatedHashOverride = 'helper.hash.override'
        const duplicateCheckComparator = Proxyquire('#src/util/comparators/duplicateCheckComparator', {
          '../hash': {
            generateSha256: sandbox.stub().returns(hash)
          }
        })
        const id = 1
        const object = { key: 'value' }
        const getDuplicateDataFuncOverride = async () => { return Promise.resolve(null) }
        const saveHashFuncOverride = sandbox.stub().resolves(true)

        const expected = {
          hasDuplicateId: false,
          hasDuplicateHash: false
        }

        // Act
        const result = await duplicateCheckComparator(id, object, getDuplicateDataFuncOverride, saveHashFuncOverride, generatedHashOverride)

        // Assert
        test.deepEqual(result, expected, 'hash saved')
        test.ok(saveHashFuncOverride.calledOnceWith(id, generatedHashOverride))
        test.end()
      } catch (err) {
        // Assert
        Logger.error(`duplicateCheckComparator failed with error - ${err}`)
        test.fail()
        test.end()
      }
    })

    duplicateCheckComparatorTest.test('save hash when id not found with empty object and generatedHashOverride is injected', async test => {
      try {
        // Arrange
        const hash = 'helper.hash'
        const generatedHashOverride = 'helper.hash.override'
        const duplicateCheckComparator = Proxyquire('#src/util/comparators/duplicateCheckComparator', {
          '../hash': {
            generateSha256: sandbox.stub().returns(hash)
          }
        })
        const id = 1
        const object = null // We don't actually care about the object when we override the hash by setting the generatedHashOverride
        const getDuplicateDataFuncOverride = async () => { return Promise.resolve(null) }
        const saveHashFuncOverride = sandbox.stub().resolves(true)

        const expected = {
          hasDuplicateId: false,
          hasDuplicateHash: false
        }

        // Act
        const result = await duplicateCheckComparator(id, object, getDuplicateDataFuncOverride, saveHashFuncOverride, generatedHashOverride)

        // Assert
        test.deepEqual(result, expected, 'hash saved')
        test.ok(saveHashFuncOverride.calledOnceWith(id, generatedHashOverride))
        test.end()
      } catch (err) {
        // Assert
        Logger.error(`duplicateCheckComparator failed with error - ${err}`)
        test.fail()
        test.end()
      }
    })

    duplicateCheckComparatorTest.end()
  })

  dccTest.end()
})
