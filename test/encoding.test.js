'use strict'

const Test = require('tape')
const Encoding = require('../src/encoding')

Test('encoding test', encodingTest => {
  encodingTest.test('base64 should', base64test => {
    base64test.test('encode and decode value', test => {
      const value = 'some value'
      const encoded = Encoding.toBase64(value)
      test.notEqual(encoded, value)
      const decoded = Encoding.fromBase64(encoded)
      test.equal(decoded, value)
      test.end()
    })

    base64test.end()
  })

  encodingTest.end()
})
