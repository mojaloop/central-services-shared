/*****
 License
 --------------
 Copyright © 2020-2026 Mojaloop Foundation
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
 - Yevhen Kyriukha

 --------------
 ******/

'use strict'

const Test = require('tapes')(require('tape'))
const sinon = require('sinon')
const Logger = require('@mojaloop/central-services-logger')

const { startingProcess, ExitCodes, CRASH_STOP_DEADLINE_MS } = require('#src/util/startingProcess')
const Util = require('#src/util/index')
const { tryCatchEndTest } = require('#test/util/helper')

const EVENTS = ['uncaughtException', 'unhandledRejection', 'SIGINT', 'SIGTERM']

Test('startingProcess', startingProcessTest => {
  let sandbox
  let listenersBefore
  let exitStub
  let exited

  const deferred = () => {
    const handle = {}
    handle.promise = new Promise((resolve, reject) => {
      handle.resolve = resolve
      handle.reject = reject
    })
    return handle
  }

  startingProcessTest.beforeEach(t => {
    sandbox = sinon.createSandbox()
    listenersBefore = Object.fromEntries(EVENTS.map(event => [event, process.listeners(event)]))
    const exit = deferred()
    exited = exit.promise
    exitStub = sandbox.stub(process, 'exit').callsFake(code => exit.resolve(code))
    sandbox.stub(Logger, 'finish').resolves()
    sandbox.stub(Logger, 'error')
    sandbox.stub(Logger, 'warn')
    sandbox.stub(Logger, 'info')
    t.end()
  })

  startingProcessTest.afterEach(t => {
    EVENTS.forEach(event => process.listeners(event)
      .filter(listener => !listenersBefore[event].includes(listener))
      .forEach(listener => process.removeListener(event, listener)))
    sandbox.restore()
    t.end()
  })

  startingProcessTest.test('is exported from Util', tryCatchEndTest(t => {
    t.equal(Util.startingProcess, startingProcess)
  }))

  startingProcessTest.test('exits with INVALID_ARGUMENTS when startFn or stopFn is not a function', tryCatchEndTest(async t => {
    await startingProcess(async () => {}, 'stop')
    t.equal(await exited, ExitCodes.INVALID_ARGUMENTS)
    t.true(Logger.finish.calledBefore(exitStub), 'logs are flushed before the exit')
  }))

  startingProcessTest.test('stops and exits with START_FAILED when startFn rejects', tryCatchEndTest(async t => {
    const stopFn = sandbox.stub().resolves()
    await startingProcess(() => Promise.reject(new Error('start failed')), stopFn)
    t.equal(await exited, ExitCodes.START_FAILED)
    t.true(stopFn.calledOnce, 'stopFn is called once')
    t.true(Logger.finish.calledBefore(exitStub), 'logs are flushed before the exit')
  }))

  startingProcessTest.test('keeps START_FAILED when stopFn rejects after a failed start', tryCatchEndTest(async t => {
    await startingProcess(() => Promise.reject(new Error('start failed')), () => Promise.reject(new Error('stop failed')))
    t.equal(await exited, ExitCodes.START_FAILED)
  }))

  startingProcessTest.test('exits with START_FAILED when stopFn outlasts the deadline after a failed start', tryCatchEndTest(async t => {
    const clock = sandbox.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    const started = startingProcess(() => Promise.reject(new Error('start failed')), () => new Promise(() => {}))

    await clock.tickAsync(CRASH_STOP_DEADLINE_MS - 1)
    t.true(exitStub.notCalled, 'process.exit waits for the deadline')
    await clock.tickAsync(1)
    t.equal(await exited, ExitCodes.START_FAILED)
    await started
  }))

  startingProcessTest.test('does not exit once started', tryCatchEndTest(async t => {
    await startingProcess(async () => {}, async () => {})
    t.true(exitStub.notCalled, 'process.exit is not called')
  }))

  startingProcessTest.test('stops on SIGTERM and exits with STOPPED', tryCatchEndTest(async t => {
    const stopFn = sandbox.stub().resolves()
    await startingProcess(async () => {}, stopFn)
    process.emit('SIGTERM')
    t.equal(await exited, ExitCodes.STOPPED)
    t.true(stopFn.calledOnce, 'stopFn is called once')
    t.true(Logger.finish.calledBefore(exitStub), 'logs are flushed before the exit')
  }))

  startingProcessTest.test('exits with STOP_FAILED when stopFn throws on SIGINT', tryCatchEndTest(async t => {
    await startingProcess(async () => {}, () => { throw new Error('stop failed') })
    process.emit('SIGINT')
    t.equal(await exited, ExitCodes.STOP_FAILED)
  }))

  startingProcessTest.test('stops on uncaughtException and exits with UNCAUGHT_EXCEPTION', tryCatchEndTest(async t => {
    const stopFn = sandbox.stub().resolves()
    await startingProcess(async () => {}, stopFn)
    process.emit('uncaughtException', new Error('crash'))
    t.equal(await exited, ExitCodes.UNCAUGHT_EXCEPTION)
    t.true(stopFn.calledOnce, 'stopFn is called once')
  }))

  startingProcessTest.test('keeps UNCAUGHT_EXCEPTION when stopFn rejects', tryCatchEndTest(async t => {
    await startingProcess(async () => {}, () => Promise.reject(new Error('stop failed')))
    process.emit('uncaughtException', new Error('crash'))
    t.equal(await exited, ExitCodes.UNCAUGHT_EXCEPTION)
  }))

  startingProcessTest.test('stops on unhandledRejection and exits with UNHANDLED_REJECTION', tryCatchEndTest(async t => {
    const stopFn = sandbox.stub().resolves()
    await startingProcess(async () => {}, stopFn)
    process.emit('unhandledRejection', new Error('rejected'), Promise.resolve())
    t.equal(await exited, ExitCodes.UNHANDLED_REJECTION)
    t.true(stopFn.calledOnce, 'stopFn is called once')
  }))

  startingProcessTest.test('exits when stopFn outlasts the crash deadline', tryCatchEndTest(async t => {
    const clock = sandbox.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    await startingProcess(async () => {}, () => new Promise(() => {}))
    process.emit('uncaughtException', new Error('crash'))

    await clock.tickAsync(CRASH_STOP_DEADLINE_MS - 1)
    t.true(exitStub.notCalled, 'process.exit waits for the deadline')
    await clock.tickAsync(1)
    t.equal(await exited, ExitCodes.UNCAUGHT_EXCEPTION)
  }))

  startingProcessTest.test('keeps the first exit code when another event arrives while stopping', tryCatchEndTest(async t => {
    const stop = deferred()
    const stopFn = sandbox.stub().returns(stop.promise)
    await startingProcess(async () => {}, stopFn)

    process.emit('uncaughtException', new Error('crash'))
    process.emit('SIGTERM')
    process.emit('unhandledRejection', new Error('rejected'), Promise.resolve())
    stop.resolve()

    t.equal(await exited, ExitCodes.UNCAUGHT_EXCEPTION)
    t.true(stopFn.calledOnce, 'stopFn is called once')
    t.true(exitStub.calledOnce, 'process.exit is called once')
  }))

  startingProcessTest.test('leaves the exit to the stop when startFn fails after a signal', tryCatchEndTest(async t => {
    const start = deferred()
    const started = startingProcess(() => start.promise, async () => {})

    process.emit('SIGTERM')
    t.equal(await exited, ExitCodes.STOPPED)
    start.reject(new Error('start failed'))
    await started

    t.true(exitStub.calledOnce, 'process.exit is called once')
  }))

  startingProcessTest.test('exits with the event exit code when Logger.finish rejects', tryCatchEndTest(async t => {
    Logger.finish.rejects(new Error('log transports made no progress'))
    await startingProcess(async () => {}, async () => {})
    process.emit('SIGTERM')

    t.equal(await exited, ExitCodes.STOPPED)
    t.true(Logger.error.calledWith('startingProcess: log transports did not finish'), 'the flush failure is logged')
  }))

  startingProcessTest.test('waits for Logger.finish before exiting', tryCatchEndTest(async t => {
    const finish = deferred()
    Logger.finish.returns(finish.promise)
    await startingProcess(async () => {}, async () => {})
    process.emit('SIGTERM')

    await new Promise(resolve => setImmediate(resolve))
    t.true(exitStub.notCalled, 'process.exit waits for Logger.finish')
    finish.resolve()
    t.equal(await exited, ExitCodes.STOPPED)
  }))

  startingProcessTest.end()
})
