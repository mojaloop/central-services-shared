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

 * Infitx
 - Kevin Leyow <kevin.leyow@infitx.com>

 --------------
 ******/

const { redact } = require('../../../src/util/redact')
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')

Test('redact', redactTest => {
  let sandbox

  redactTest.beforeEach(test => {
    sandbox = Sinon.createSandbox()
    test.end()
  })

  redactTest.afterEach(test => {
    sandbox.restore()
    test.end()
  })

  redactTest.test('should redact default sensitive keys', test => {
    const input = {
      password: '1234',
      user: 'alice',
      token: 'abcd',
      nested: {
        secret: 'mysecret',
        notSensitive: 'ok'
      }
    }
    const expected = {
      password: '[REDACTED]',
      user: 'alice',
      token: '[REDACTED]',
      nested: {
        secret: '[REDACTED]',
        notSensitive: 'ok'
      }
    }
    test.deepEqual(redact(input), expected, 'redacts default sensitive keys')
    test.end()
  })

  redactTest.test('should redact sensitive values (JWT, private key, etc)', test => {
    const input = {
      jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      privateKey: '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----',
      normal: 'hello'
    }
    const expected = {
      jwt: '[REDACTED]',
      privateKey: '[REDACTED]',
      normal: 'hello'
    }
    test.deepEqual(redact(input), expected, 'redacts sensitive values')
    test.end()
  })

  redactTest.test('should redact keys matching patterns (case-insensitive)', test => {
    const input = {
      SecretKey: 'shouldHide',
      Password: 'shouldHide',
      PrivateStuff: 'shouldHide',
      Token: 'shouldHide',
      Key: 'shouldHide',
      notSensitive: 'ok'
    }
    const expected = {
      SecretKey: '[REDACTED]',
      Password: '[REDACTED]',
      PrivateStuff: '[REDACTED]',
      Token: '[REDACTED]',
      Key: '[REDACTED]',
      notSensitive: 'ok'
    }
    test.deepEqual(redact(input), expected, 'redacts keys matching patterns')
    test.end()
  })

  redactTest.test('should redact deeply nested sensitive keys and values', test => {
    const input = {
      level1: {
        level2: {
          password: 'deepSecret',
          info: {
            token: 'deepToken',
            arr: [
              { secret: 'arraySecret' },
              { notSensitive: 'ok' }
            ]
          }
        }
      }
    }
    const expected = {
      level1: {
        level2: {
          password: '[REDACTED]',
          info: {
            token: '[REDACTED]',
            arr: [
              { secret: '[REDACTED]' },
              { notSensitive: 'ok' }
            ]
          }
        }
      }
    }
    test.deepEqual(redact(input), expected, 'redacts deeply nested sensitive keys and values')
    test.end()
  })

  redactTest.test('should redact extraKeys provided', test => {
    const input = {
      custom: 'hideMe',
      normal: 'showMe'
    }
    const expected = {
      custom: '[REDACTED]',
      normal: 'showMe'
    }
    test.deepEqual(redact(input, ['custom']), expected, 'redacts extraKeys provided')
    test.end()
  })

  redactTest.test('should handle arrays of objects', test => {
    const input = [
      { password: '123' },
      { token: 'abc' },
      { value: 'ok' }
    ]
    const expected = [
      { password: '[REDACTED]' },
      { token: '[REDACTED]' },
      { value: 'ok' }
    ]
    test.deepEqual(redact(input), expected, 'handles arrays of objects')
    test.end()
  })

  redactTest.test('should not redact non-sensitive data', test => {
    const input = {
      name: 'bob',
      age: 30,
      nested: {
        city: 'NY'
      }
    }
    test.deepEqual(redact(input), input, 'does not redact non-sensitive data')
    test.end()
  })

  redactTest.test('should handle null and undefined gracefully', test => {
    test.equal(redact(null), null, 'returns null for null')
    test.equal(redact(undefined), undefined, 'returns undefined for undefined')
    test.end()
  })

  redactTest.test('should not mutate the original object', test => {
    const input = { password: '1234', user: 'alice' }
    const copy = JSON.parse(JSON.stringify(input))
    redact(input)
    test.deepEqual(input, copy, 'does not mutate original object')
    test.end()
  })

  redactTest.test('should redact values matching extraPatterns', test => {
    const input = {
      normal: 'hello',
      suspicious: 'my-pin-1234'
    }
    const expected = {
      normal: 'hello',
      suspicious: '[REDACTED]'
    }
    const extraPatterns = [/pin-\d+/i]
    test.deepEqual(redact(input, [], extraPatterns), expected, 'redacts values matching extraPatterns')
    test.end()
  })

  redactTest.test('should handle objects with numeric, boolean, and null values', test => {
    const input = {
      count: 5,
      enabled: true,
      disabled: false,
      nothing: null,
      password: 'shouldHide'
    }
    const expected = {
      count: 5,
      enabled: true,
      disabled: false,
      nothing: null,
      password: '[REDACTED]'
    }
    test.deepEqual(redact(input), expected, 'handles various primitive types')
    test.end()
  })

  redactTest.test('should handle objects with undefined values', test => {
    const input = {
      foo: undefined,
      password: 'bar'
    }
    const expected = {
      foo: undefined,
      password: '[REDACTED]'
    }
    test.deepEqual(redact(input), expected, 'handles undefined values')
    test.end()
  })

  redactTest.test('should redact keys with mixed case and underscores', test => {
    const input = {
      Api_Key: 'hideThis',
      Client_Secret: 'hideThisToo',
      notSensitive: 'ok'
    }
    const expected = {
      Api_Key: '[REDACTED]',
      Client_Secret: '[REDACTED]',
      notSensitive: 'ok'
    }
    test.deepEqual(redact(input), expected, 'redacts keys with mixed case and underscores')
    test.end()
  })

  redactTest.test('should redact keys and values in arrays nested in objects', test => {
    const input = {
      users: [
        { username: 'alice', password: 'pw1' },
        { username: 'bob', token: 'tok2' }
      ]
    }
    const expected = {
      users: [
        { username: 'alice', password: '[REDACTED]' },
        { username: 'bob', token: '[REDACTED]' }
      ]
    }
    test.deepEqual(redact(input), expected, 'redacts sensitive data in arrays within objects')
    test.end()
  })

  redactTest.test('should redact keys with dashes and spaces', test => {
    const input = {
      'set-cookie': 'sessionid=abc',
      'RSA PRIVATE KEY': 'something',
      'not sensitive': 'ok'
    }
    const expected = {
      'set-cookie': '[REDACTED]',
      'RSA PRIVATE KEY': '[REDACTED]',
      'not sensitive': 'ok'
    }
    test.deepEqual(redact(input), expected, 'redacts keys with dashes and spaces')
    test.end()
  })

  redactTest.test('should redact values containing bearer tokens', test => {
    const input = {
      authorization: 'Bearer abcdef123456',
      info: 'bearer xyz789'
    }
    const expected = {
      authorization: '[REDACTED]',
      info: '[REDACTED]'
    }
    test.deepEqual(redact(input), expected, 'redacts bearer tokens in values')
    test.end()
  })

  redactTest.test('should handle empty objects and arrays', test => {
    test.deepEqual(redact({}), {}, 'handles empty object')
    test.deepEqual(redact([]), [], 'handles empty array')
    test.end()
  })

  redactTest.end()
})
