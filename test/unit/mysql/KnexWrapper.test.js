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
// const sinon = require('sinon')

const { KnexWrapper } = require('#src/mysql/index')
const { logger } = require('#src/logger')
const { tryCatchEndTest } = require('#test/util/helper')

const mockDeps = ({
  knexOptions = mockKnexOptions(),
  retryOptions = mockRetryOptions(),
  metrics = {
    getCounter: () => ({
      inc: () => {} // todo: use stub
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
  wrapperTests.test('should create an instance', tryCatchEndTest(t => {
    const wrapper = new KnexWrapper(mockDeps())
    t.false(wrapper.isConnected, 'wrapper is not connected')
  }))

  wrapperTests.end()
})
