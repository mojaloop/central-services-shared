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
 - Name Surname <name.surname@mojaloop.io>

 * Georgi Georgiev <georgi.georgiev@modusbox.com>
 --------------
 ******/

'use strict'

const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Logger = require('@mojaloop/central-services-logger')
const Model = require('../../../src/util/time')

const execDelayCoef = 1.5

Test('Time', async (timeTest) => {
  let sandbox
  let clock
  const now = new Date()

  timeTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    clock = Sinon.useFakeTimers(now.getTime())
    t.end()
  })

  timeTest.afterEach(t => {
    sandbox.restore()
    clock.restore()
    t.end()
  })

  timeTest.test('sleep should', (test) => {
    try {
      const defaultDelay = 10
      clock.restore()
      const start = new Date()
      Model.sleep()
      const delay = new Date() - start
      test.ok(defaultDelay <= delay && delay <= defaultDelay * execDelayCoef, `pa4se script execution by default delay of ${defaultDelay} ms`)
      test.end()
    } catch (err) {
      Logger.error(`sleep failed with error - ${err}`)
      test.fail()
      test.end()
    }
  })

  timeTest.test('sleep should', (test) => {
    try {
      const testDelay = 20
      const debug = true
      clock.restore()
      const start = new Date()
      Model.sleep(testDelay, debug)
      const delay = new Date() - start
      test.ok(testDelay <= delay && delay <= testDelay * execDelayCoef, `pa4se script execution with given delay of ${testDelay} ms in debug mode`)
      test.end()
    } catch (err) {
      Logger.error(`sleep failed with error - ${err}`)
      test.fail()
      test.end()
    }
  })

  timeTest.test('sleep should', (test) => {
    try {
      const testDelay = 20
      const debug = true
      const caller = 'time.test.js'
      const reason = 'testing'
      clock.restore()
      const start = new Date()
      Model.sleep(testDelay, debug, caller, reason)
      const delay = new Date() - start
      test.ok(testDelay <= delay && delay <= testDelay * execDelayCoef, `pa4se script execution with given delay of ${testDelay} ms in debug mode with caller and reason`)
      test.end()
    } catch (err) {
      Logger.error(`sleep failed with error - ${err}`)
      test.fail()
      test.end()
    }
  })

  await timeTest.test('msCurrentYear should', async (test) => {
    try {
      const now = new Date()
      const pastDate = new Date(now.getFullYear(), 0)
      const expectedResult = now - pastDate
      const result = await Model.msCurrentYear()
      test.equal(result, expectedResult, 'return milliseconds since beginning of the year')
      test.end()
    } catch (err) {
      Logger.error(`msCurrentYear failed with error - ${err}`)
      test.fail()
      test.end()
    }
  })

  await timeTest.test('msCurrentMonth should', async (test) => {
    try {
      const now = new Date()
      const pastDate = new Date(now.getFullYear(), now.getMonth())
      const expectedResult = now - pastDate
      const result = await Model.msCurrentMonth()
      test.equal(result, expectedResult, 'return milliseconds since beginning of the month')
      test.end()
    } catch (err) {
      Logger.error(`msCurrentMonth failed with error - ${err}`)
      test.fail()
      test.end()
    }
  })

  await timeTest.test('msToday should', async (test) => {
    try {
      const now = new Date()
      const pastDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const expectedResult = now - pastDate
      const result = await Model.msToday()
      test.equal(result, expectedResult, 'return milliseconds since beginning of the day')
      test.end()
    } catch (err) {
      Logger.error(`msToday failed with error - ${err}`)
      test.fail()
      test.end()
    }
  })

  await timeTest.test('getCurrentUTCTimeInMilliseconds should', async (test) => {
    try {
      const expectedResult = new Date().getTime()
      const result = await Model.getCurrentUTCTimeInMilliseconds()
      test.equal(result, expectedResult, 'return current UTC time in milliseconds')
      test.end()
    } catch (err) {
      Logger.error(`getCurrentUTCTimeInMilliseconds failed with error - ${err}`)
      test.fail()
      test.end()
    }
  })

  await timeTest.test('getUTCString should return a UTC string of the date', async (test) => {
    try {
      const expectedResult = '1995-12-04 00:12:00.000'
      const setDate = new Date(Date.parse('04 Dec 1995 00:12:00 GMT'))
      const result = await Model.getUTCString(setDate)
      test.equal(result, expectedResult, 'return current UTC time in milliseconds')
      test.end()
    } catch (err) {
      Logger.error(`getUTCString failed with error - ${err}`)
      test.fail()
      test.end()
    }
  })

  await timeTest.test('getYMDString should return a YYYYMMDD string of the date', async (test) => {
    try {
      const expectedResult = '19951204'
      const setDate = new Date(Date.parse('04 Dec 1995 00:12:00 GMT'))
      const result = await Model.getYMDString(setDate)
      test.equal(result, expectedResult, 'return YYYYMMDD string')
      test.end()
    } catch (err) {
      Logger.error(`getYMDString failed with error - ${err}`)
      test.fail()
      test.end()
    }
  })

  await timeTest.end()
})
