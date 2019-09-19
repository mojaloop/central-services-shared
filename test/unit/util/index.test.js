/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Georgi Georgiev <georgi.georgiev@modusbox.com>
 * Rajiv Mothilal <rajiv.mothilal@modusbox.com>
 * Miguel de Barros <miguel.debarros@modusbox.com>
 --------------
 ******/

'use strict'

const Test = require('tape')
const Util = require('../../../src/util')

Test('General util', utilTest => {
  utilTest.test('formatAmount should', formatAmountTest => {
    formatAmountTest.test('format integer', test => {
      const value = parseInt('100')
      test.equal(Util.formatAmount(value), '100.00')
      test.end()
    })

    formatAmountTest.test('format decimal', test => {
      const value = parseFloat('100.01')
      test.equal(Util.formatAmount(value), '100.01')
      test.end()
    })

    formatAmountTest.test('format string', test => {
      const value = '5.1'
      test.equal(Util.formatAmount(value), '5.10')
      test.end()
    })
    formatAmountTest.end()
  })

  utilTest.test('parseJson should', parseJsonTest => {
    parseJsonTest.test('return null if value null', test => {
      const value = null
      test.notOk(Util.parseJson(value))
      test.end()
    })
    parseJsonTest.test('return value if value not string', test => {
      const value = {}
      test.equal(Util.parseJson(value), value)
      test.end()
    })

    parseJsonTest.test('return value if number', test => {
      const value = 1000
      test.equal(Util.parseJson(value), value)
      test.end()
    })

    parseJsonTest.test('return value if string that is not json', test => {
      const value = 'some really long string'
      test.equal(Util.parseJson(value), value)
      test.end()
    })

    parseJsonTest.test('return object if value is json string', test => {
      const obj = {
        prop1: 'test',
        prop2: {
          date_time: new Date().toDateString(),
          number: 1000
        }
      }
      const value = JSON.stringify(obj)

      const result = Util.parseJson(value)
      test.notEqual(result, value)
      test.deepEqual(result, obj)
      test.end()
    })
    parseJsonTest.end()
  })

  utilTest.test('filterUndefined should', filterUndefinedTest => {
    filterUndefinedTest.test('return map with undefined values stripped out', test => {
      const undefinedMap = {}
      const obj1 = {
        prop1: 'test',
        prop2: {
          date_time: new Date().toDateString(),
          number: 1000
        },
        prop3: undefinedMap.prop3,
        prop4: null
      }

      const obj2 = {
        prop1: 'test',
        prop2: {
          date_time: new Date().toDateString(),
          number: 1000
        },
        prop4: null
      }

      const result = Util.filterUndefined(obj1)
      test.deepEqual(result, obj2)
      test.end()
    })
    filterUndefinedTest.end()
  })

  utilTest.test('omitNil should', omitNilTest => {
    omitNilTest.test('return object with undefined values stripped out', test => {
      const obj1 = {
        prop1: 'test',
        prop2: {
          date_time: new Date().toDateString(),
          number: 1000
        },
        prop3: null,
        prop4: null
      }

      const expected = {
        prop1: 'test',
        prop2: {
          date_time: new Date().toDateString(),
          number: 1000
        }
      }

      const result = Util.omitNil(obj1)
      test.deepEqual(result, expected)
      test.end()
    })
    omitNilTest.end()
  })

  utilTest.test('pick should', pickTest => {
    pickTest.test('return object with only expected properties', test => {
      const obj1 = {
        prop1: 'test',
        prop2: {
          date_time: new Date().toDateString(),
          number: 1000
        },
        prop3: null,
        prop4: null
      }

      const properties = ['prop1', 'prop2']

      const expected = {
        prop1: 'test',
        prop2: {
          date_time: new Date().toDateString(),
          number: 1000
        }
      }

      const result = Util.pick(obj1, properties)
      test.deepEqual(result, expected)
      test.end()
    })
    pickTest.end()
  })

  utilTest.test('assign should', assignTest => {
    assignTest.test('return target object with properties assigned from the source', test => {
      const obj1 = {
        prop1: 'test',
        prop2: {
          date_time: new Date().toDateString(),
          number: 1000
        },
        prop5: 99
      }

      const obj2 = {
        prop3: 'test2',
        prop4: {
          number: 2000
        },
        prop5: 100
      }

      const expected = {
        prop1: 'test',
        prop2: {
          date_time: new Date().toDateString(),
          number: 1000
        },
        prop3: 'test2',
        prop4: {
          number: 2000
        },
        prop5: 100
      }

      const result = Util.assign(obj1, obj2)
      test.deepEqual(result, expected)
      test.end()
    })
    assignTest.end()
  })

  utilTest.test('merge should', mergeTest => {
    mergeTest.test('return target object with properties merged from the source', test => {
      const obj1 = {
        prop1: 'test',
        prop2: {
          date_time: new Date().toDateString(),
          number: 1000
        },
        prop5: 99
      }

      const obj2 = {
        prop3: 'test2',
        prop4: {
          number: 2000
        },
        prop5: 100
      }

      const expected = {
        prop1: 'test',
        prop2: {
          date_time: new Date().toDateString(),
          number: 1000
        },
        prop3: 'test2',
        prop4: {
          number: 2000
        },
        prop5: 100
      }

      const result = Util.merge(obj1, obj2)
      test.deepEqual(result, expected)
      test.end()
    })
    mergeTest.end()
  })

  utilTest.test('mergeAndOmitNil should', mergeAndOmitNilTest => {
    mergeAndOmitNilTest.test('return target object with properties merged from the source omitting undefined properties', test => {
      const obj1 = {
        prop1: 'test',
        prop2: {
          date_time: new Date().toDateString(),
          number: 1000
        },
        prop5: 99,
        prop6: null
      }

      const obj2 = {
        prop3: 'test2',
        prop4: {
          number: 2000
        },
        prop5: 100,
        prop7: null
      }

      const expected = {
        prop1: 'test',
        prop2: {
          date_time: new Date().toDateString(),
          number: 1000
        },
        prop3: 'test2',
        prop4: {
          number: 2000
        },
        prop5: 100
      }

      const result = Util.mergeAndOmitNil(obj1, obj2)
      test.deepEqual(result, expected)
      test.end()
    })
    mergeAndOmitNilTest.end()
  })

  utilTest.test('squish should', squishTest => {
    squishTest.test('return a string by joining elements of an array', test => {
      const array1 = [1, 2, 3, 4, 5]

      const expected = '1|2|3|4|5'

      const result = Util.squish(array1)
      test.equal(result, expected)
      test.end()
    })
    squishTest.end()
  })

  utilTest.test('expand should', expandTest => {
    expandTest.test('return an array by splitting a string', test => {
      const expected = ['1', '2', '3', '4', '5']

      const string = '1|2|3|4|5'

      const result = Util.expand(string)
      test.deepEqual(result, expected)
      test.end()
    })

    expandTest.test('return null if null is passed', test => {
      const expected = null

      const string = null

      const result = Util.expand(string)
      test.deepEqual(result, expected)
      test.end()
    })
    expandTest.end()
  })

  utilTest.test('clone should', cloneTest => {
    cloneTest.test('return a copied object with the same properties', test => {
      const obj1 = {
        prop1: 'test',
        prop2: {
          date_time: new Date().toDateString(),
          number: 1000
        },
        prop3: null,
        prop4: null
      }

      const expected = JSON.parse(JSON.stringify(obj1))

      const result = Util.clone(obj1)

      test.deepEqual(result, expected)
      test.end()
    })
    cloneTest.end()
  })

  utilTest.test('deleteFieldByCaseInsensitiveKey should', deleteFieldByCaseInsensitiveKeyTest => {
    deleteFieldByCaseInsensitiveKeyTest.test('delete a property from a specific object regardless of case sensitivity', test => {
      const obj1 = {
        prop1: 'test',
        prop2: {
          date_time: new Date().toDateString(),
          number: 1000
        },
        prop3: null,
        prop4: null
      }

      const expected = JSON.parse(JSON.stringify(obj1))

      delete expected.prop3

      Util.deleteFieldByCaseInsensitiveKey(obj1, 'ProP3')

      test.deepEqual(obj1, expected)
      test.end()
    })

    deleteFieldByCaseInsensitiveKeyTest.test('delete a property from a specific object regardless of case sensitivity that does not exist', test => {
      const obj1 = {
        prop1: 'test',
        prop2: {
          date_time: new Date().toDateString(),
          number: 1000
        },
        prop3: null,
        prop4: null
      }

      const expected = JSON.parse(JSON.stringify(obj1))

      Util.deleteFieldByCaseInsensitiveKey(obj1, 'does not exist')

      test.deepEqual(obj1, expected)
      test.end()
    })

    deleteFieldByCaseInsensitiveKeyTest.end()
  })

  utilTest.test('getValueByCaseInsensitiveKey should', getValueByCaseInsensitiveKeyTest => {
    getValueByCaseInsensitiveKeyTest.test('return a value from an object regardless of key case sensitivity', test => {
      const obj1 = {
        prop1: 'test',
        prop2: {
          date_time: new Date().toDateString(),
          number: 1000
        },
        prop3: null,
        prop4: null
      }

      const expected = obj1.prop1

      const result = Util.getValueByCaseInsensitiveKey(obj1, 'ProP1')

      test.deepEqual(result, expected)
      test.end()
    })

    getValueByCaseInsensitiveKeyTest.test('return no value from an object regardless of key case sensitivity if it does not exist', test => {
      const obj1 = {
        prop1: 'test',
        prop2: {
          date_time: new Date().toDateString(),
          number: 1000
        },
        prop3: null,
        prop4: null
      }

      const expected = undefined

      const result = Util.getValueByCaseInsensitiveKey(obj1, 'does not exist')

      test.deepEqual(result, expected)
      test.end()
    })

    getValueByCaseInsensitiveKeyTest.end()
  })

  utilTest.test('setValueByCaseInsensitiveKey should', setValueByCaseInsensitiveKeyTest => {
    setValueByCaseInsensitiveKeyTest.test('set a value from an object regardless of key case sensitivity', test => {
      const obj1 = {
        prop1: 'test',
        prop2: {
          date_time: new Date().toDateString(),
          number: 1000
        },
        prop3: null,
        prop4: null
      }

      const expected = Util.clone(obj1)
      expected.prop1 = 'value'

      Util.setValueByCaseInsensitiveKey(obj1, 'ProP1', 'value')

      test.deepEqual(obj1, expected)
      test.end()
    })

    setValueByCaseInsensitiveKeyTest.test('not set a value from an object regardless of key case sensitivity if it does not exist', test => {
      const obj1 = {
        prop1: 'test',
        prop2: {
          date_time: new Date().toDateString(),
          number: 1000
        },
        prop3: null,
        prop4: null
      }

      const expected = Util.clone(obj1)

      Util.setValueByCaseInsensitiveKey(obj1, 'does not exist', 'value')

      test.deepEqual(obj1, expected)
      test.end()
    })

    setValueByCaseInsensitiveKeyTest.end()
  })

  utilTest.test('breadcrumb should', breadcrumbTest => {
    breadcrumbTest.test('reset location method when provided by message object', (test) => {
      const location = { module: 'Module', method: '', path: '' }
      const message = { method: 'method' }
      const expected = 'Module::method'

      const result = Util.breadcrumb(location, message)
      test.equal(location.method, message.method, 'method reset')
      test.equal(result, expected, 'result matched')
      test.end()
    })

    breadcrumbTest.test('reset location path when provided by message object', (test) => {
      const location = { module: 'Module', method: 'method', path: '' }
      const message = { path: 'path' }
      const expected = 'Module::method::path'

      const result = Util.breadcrumb(location, message)
      test.equal(location.path, `${location.module}::${location.method}::${message.path}`, 'path reset')
      test.equal(result, expected, 'result matched')
      test.end()
    })

    breadcrumbTest.test('append location path when provided by message string', (test) => {
      const path = 'path'
      const location = { module: 'Module', method: 'method', path }
      const message = 'message'
      const expected = `${path}::${message}`
      const result = Util.breadcrumb(location, message)
      test.equal(location.path, `${path}::${message}`, 'path appended')
      test.equal(result, expected, 'result matched')
      test.end()
    })

    breadcrumbTest.test('return path unchanged when message is not provided', (test) => {
      const path = 'path'
      const location = { module: 'Module', method: 'method', path }
      const expected = `${path}`

      const result = Util.breadcrumb(location)
      test.equal(result, expected, 'result matched')
      test.end()
    })

    breadcrumbTest.end()
  })

  utilTest.test('transpose should', transposeTest => {
    transposeTest.test('return hash for a given object', test => {
      const obj1 = {
        prop1: 'test',
        prop2: 2,
        prop3: null,
        prop4: null
      }

      const expected = new Map()
      expected.test = 'prop1'
      expected['2'] = 'prop2'
      expected.null = 'prop4'

      const result = Util.transpose(obj1)
      test.deepEqual(result, expected)
      test.end()
    })
    transposeTest.end()
  })

  utilTest.end()
})
