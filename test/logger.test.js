'use strict'

const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Winston = require('winston')
const Logger = require('../src/logger')

Test('logger', function (loggerTest) {
  let sandbox
  let addMethod
  let logMethod

  loggerTest.beforeEach(t => {
    sandbox = Sinon.sandbox.create()
    sandbox.stub(Winston, 'Logger')
    addMethod = Sinon.stub()
    logMethod = Sinon.stub()
    addMethod.returns({ log: logMethod })
    Winston.Logger.returns({ add: addMethod })
    t.end()
  })

  loggerTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  loggerTest.test('configure Winston', function (assert) {
    let logger = new Logger.Logger()
    assert.ok(logger)
    assert.ok(Winston.Logger.calledWithNew)
    assert.ok(addMethod.calledWith(Winston.transports.Console, Sinon.match({ timestamp: true, colorize: true })))
    assert.end()
  })

  loggerTest.test('log debug level', function (assert) {
    let logger = new Logger.Logger()
    logger.debug('test %s', 'me')
    assert.ok(logMethod.calledWith('debug', 'test %s', 'me'))
    assert.end()
  })

  loggerTest.test('log info level', function (assert) {
    let logger = new Logger.Logger()
    let infoMessage = 'things are happening'
    logger.info(infoMessage)
    assert.ok(logMethod.calledWith('info', infoMessage))
    assert.end()
  })

  loggerTest.test('log warn level', function (assert) {
    let logger = new Logger.Logger()
    let warnMessage = 'something bad is happening'
    logger.warn(warnMessage)
    assert.ok(logMethod.calledWith('warn', warnMessage))
    assert.end()
  })

  loggerTest.test('log error level', function (assert) {
    let logger = new Logger.Logger()
    let errorMessage = 'there was an exception'
    let ex = new Error()
    logger.error(errorMessage, ex)
    assert.ok(logMethod.calledWith('error', errorMessage, ex))

    assert.end()
  })

  loggerTest.end()
})
