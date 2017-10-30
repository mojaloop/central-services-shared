'use strict'

const Test = require('tape')
const BaseError = require('../../src/errors/base')

class TestError extends BaseError {
  constructor (category = 'TestCategory', message = 'No message') {
    super(category, message)
  }
}

Test('BaseError test', errorTest => {
  errorTest.test('payload should', payloadTest => {
    payloadTest.test('assign error_id to constructor name and message to supplied message', test => {
      let error = new TestError()

      test.equal(error.payload.id, 'TestError')
      test.equal(error.payload.message, error.message)
      test.end()
    })

    payloadTest.end()
  })

  errorTest.end()
})
