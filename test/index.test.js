'use strict'

const Test = require('tape')

const Index = require('../src')

Test('Index', indexTest => {
  indexTest.test('Exports Logger', test => {
    test.equal(Index.Logger, require('../src/logger'))
    test.end()
  })
  indexTest.test('Exports Util', test => {
    test.equal(Index.Util, require('../src/util'))
    test.end()
  })

  indexTest.end()
})
