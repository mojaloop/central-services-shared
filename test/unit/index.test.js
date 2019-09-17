'use strict'

const Test = require('tape')

const Index = require('../../src')

Test('Index', indexTest => {
  indexTest.test('Exports HealthCheck', test => {
    test.equal(Index.HealthCheck, require('../../src/healthCheck'))
    test.end()
  })

  indexTest.test('Exports Enum', test => {
    test.equal(Index.Enum, require('../../src/enums'))
    test.end()
  })

  indexTest.test('Exports Util', test => {
    test.equal(Index.Util, require('../../src/util'))
    test.end()
  })

  indexTest.end()
})
