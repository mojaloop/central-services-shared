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

const process = require('node:process')
const Logger = require('@mojaloop/central-services-logger')

// Slowest stop measured for the largest pod in the charts was 6605 ms: the
// quoting-service handler's 9 consumers disconnected through stream's
// Util.Consumer.disconnectAll() on Node's default 4-thread pool, where every
// disconnect queues behind consumes waiting up to consumeTimeout (1000 ms).
// The rest is margin for stops under CPU load, which were not measured.
const CRASH_STOP_DEADLINE_MS = 10000

const ExitCodes = Object.freeze({
  STOPPED: 0,
  START_FAILED: 1,
  UNCAUGHT_EXCEPTION: 2,
  UNHANDLED_REJECTION: 3,
  INVALID_ARGUMENTS: 4,
  STOP_FAILED: 5
})

const SIGNALS = Object.freeze(['SIGINT', 'SIGTERM'])

const exit = async (code) => {
  try {
    await Logger.finish()
  } catch (err) {
    Logger.error('startingProcess: log transports did not finish', err)
  }
  process.exit(code)
}

const withinDeadline = (promise, deadlineMs) => {
  let timer
  const deadline = new Promise((resolve, reject) => {
    timer = setTimeout(() => reject(new Error(`stop did not finish within ${deadlineMs} ms`)), deadlineMs)
  })
  return Promise.race([promise, deadline]).finally(() => clearTimeout(timer))
}

/**
 * Starts a process and owns its exit: SIGINT/SIGTERM stop it, an uncaught
 * exception, an unhandled rejection or a failed start stops it within
 * CRASH_STOP_DEADLINE_MS, and every exit waits for Logger.finish(). The first
 * event decides the exit code.
 *
 * @param {() => Promise<unknown>} startFn - starts the service
 * @param {() => Promise<unknown>} stopFn - stops the service and releases its clients
 * @returns {Promise<void>} settles once startFn has finished
 */
const startingProcess = (startFn, stopFn) => {
  if (typeof startFn !== 'function' || typeof stopFn !== 'function') {
    Logger.error('startingProcess: startFn and stopFn must be functions')
    return exit(ExitCodes.INVALID_ARGUMENTS)
  }

  let stopping = false

  const stop = async (event, code, deadlineMs) => {
    if (stopping) {
      Logger.warn(`startingProcess: ${event} while stopping, exit code unchanged`)
      return
    }
    stopping = true
    let exitCode = code
    try {
      const stopped = Promise.resolve().then(stopFn)
      await (deadlineMs ? withinDeadline(stopped, deadlineMs) : stopped)
      Logger.info(`startingProcess: stopped after ${event}`)
    } catch (err) {
      Logger.error(`startingProcess: stop after ${event} failed`, err)
      if (code === ExitCodes.STOPPED) exitCode = ExitCodes.STOP_FAILED
    }
    await exit(exitCode)
  }

  process.on('uncaughtException', (err) => {
    Logger.error('startingProcess: uncaughtException', err)
    return stop('uncaughtException', ExitCodes.UNCAUGHT_EXCEPTION, CRASH_STOP_DEADLINE_MS)
  })
  process.on('unhandledRejection', (reason) => {
    Logger.error('startingProcess: unhandledRejection', reason)
    return stop('unhandledRejection', ExitCodes.UNHANDLED_REJECTION, CRASH_STOP_DEADLINE_MS)
  })
  SIGNALS.forEach(signal => process.on(signal, () => {
    Logger.info(`startingProcess: ${signal}, stopping`)
    return stop(signal, ExitCodes.STOPPED)
  }))

  const startTime = Date.now()
  return Promise.resolve()
    .then(startFn)
    .then(() => {
      Logger.info('startingProcess: started', { startDurationMs: Date.now() - startTime })
    })
    .catch(async (err) => {
      Logger.error('startingProcess: start failed', err)
      await stop('failed start', ExitCodes.START_FAILED, CRASH_STOP_DEADLINE_MS)
    })
}

module.exports = {
  startingProcess,
  ExitCodes,
  CRASH_STOP_DEADLINE_MS
}
