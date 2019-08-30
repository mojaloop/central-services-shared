'use strict'

const Chance = require('chance')
// TODO: this should be parametrised a bit more, and we should test a range of specific, and
// randomly-generated resources
const RESOURCE = 'parties'
const test = require('tapes')(require('tape'))
const fs = require('fs')
const path = require('path')
const {
  generateAcceptRegex,
  generateContentTypeRegex,
  parseContentTypeHeader,
  parseAcceptHeader
} = require('../../../../src/util/headerValidation/index')
const {
  generateAcceptHeader,
  generateAcceptVersions,
  generateContentTypeHeader,
  generateContentTypeVersion,
  validAcceptHeaders,
  invalidAcceptHeaders,
  validContentTypeHeaders,
  invalidContentTypeHeaders
} = require('./support')
const chance = new Chance()

// The tests store failures in a file for easier inspection- this is because test failures for
// fuzzing can be large
const saveToTempFile = (data, fname) => {
  const dirPath = fs.mkdtempSync('testfail')
  const fPath = path.join(dirPath, fname)
  fs.writeFileSync(fPath, data)
  return fPath
}

// The actual regex for the resource we're testing
const acceptRes = generateAcceptRegex(RESOURCE)

test('Run positive accept header test suite', t => {
  const positiveTestSuite = validAcceptHeaders(RESOURCE)
  const failures = positiveTestSuite.filter(h => h.match(acceptRes) === null)
  if (failures.length !== 0) {
    return t.fail(`Positive test suite failed. Failures: \n'${failures.join('\'\n\'')}'.`)
  }
  t.end()
})

test('Run negative accept header test suite', t => {
  const negativeTestSuite = invalidAcceptHeaders(RESOURCE)
  const failures = negativeTestSuite.filter(h => h.match(acceptRes) !== null)
  if (failures.length !== 0) {
    return t.fail(`Negative test suite failed. Failures: \n'${failures.join('\'\n\'')}'.`)
  }
  t.end()
})

test('Run negative accept fuzz', t => {
  // Removed a, A from chance's default string pool. This prevents a chance (the adjective, not
  // the noun) generation of a valid header. We could equally have removed any other letter in
  // the string '/.+abcdeijlnoprstvyABCDEIJLNOPRSTVY', containing each character in a valid
  // version header.
  const pool = 'bcdefghijklmnopqrstuvwxyzBCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()[]'
  const negativeFuzzTestSuite = Array.from({ length: 100000 }, () => chance.string({ pool }) + chance.string())
  const failures = negativeFuzzTestSuite.filter(h => h.match(acceptRes) !== null)
  if (failures.length !== 0) {
    const fname = saveToTempFile('\'' + failures.join('\'\n\'') + '\'', 'negativefuzz')
    return t.fail(`Negative fuzz failed. Failures saved to: ${fname}.`)
  }
  t.end()
})

test('Run positive accept header fuzz', t => {
  const positiveFuzzTestSuite = Array.from({ length: 100000 },
    () => generateAcceptHeader(RESOURCE, generateAcceptVersions()))
  const failures = positiveFuzzTestSuite.filter(h => h.match(acceptRes) === null)
  if (failures.length !== 0) {
    const fname = saveToTempFile('\'' + failures.join('\'\n\'') + '\'', 'positivefuzz')
    return t.fail(`Positive fuzz failed. Failures saved to: ${fname}.`)
  }
  t.end()
})

const contentTypeRes = generateContentTypeRegex(RESOURCE)

test('Run positive content-type header test suite', t => {
  const positiveTestSuite = validContentTypeHeaders(RESOURCE)
  const failures = positiveTestSuite.filter(h => h.match(contentTypeRes) === null)
  if (failures.length !== 0) {
    return t.fail(`Positive test suite failed. Failures: \n'${failures.join('\'\n\'')}'.`)
  }
  t.end()
})

test('Run negative content-type header test suite', t => {
  const negativeTestSuite = invalidContentTypeHeaders(RESOURCE)
  const failures = negativeTestSuite.filter(h => h.match(contentTypeRes) !== null)
  if (failures.length !== 0) {
    return t.fail(`Negative test suite failed. Failures: \n'${failures.join('\'\n\'')}'.`)
  }
  t.end()
})

test('Run negative content-type header fuzz', t => {
  // Removed a, A from chance's default string pool. This prevents a chance (the adjective, not
  // the noun) generation of a valid header. We could equally have removed any other letter in
  // the string '/.+abcdeijlnoprstvyABCDEIJLNOPRSTVY', containing each character in a valid
  // version header.
  const pool = 'bcdefghijklmnopqrstuvwxyzBCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()[]'
  const negativeFuzzTestSuite = Array.from({ length: 100000 }, () => chance.string({ pool }) + chance.string())
  const failures = negativeFuzzTestSuite.filter(h => h.match(contentTypeRes) !== null)
  if (failures.length !== 0) {
    const fname = saveToTempFile('\'' + failures.join('\'\n\'') + '\'', 'negativefuzz')
    return t.fail(`Negative fuzz failed. Failures saved to: ${fname}.`)
  }
  t.end()
})

test('Run positive content-type header fuzz', t => {
  const positiveFuzzTestSuite = Array.from({ length: 100000 },
    () => generateContentTypeHeader(RESOURCE, generateContentTypeVersion()))
  const failures = positiveFuzzTestSuite.filter(h => h.match(contentTypeRes) === null)
  if (failures.length !== 0) {
    const fname = saveToTempFile('\'' + failures.join('\'\n\'') + '\'', 'positivefuzz')
    return t.fail(`Positive fuzz failed. Failures saved to: ${fname}.`)
  }
  t.end()
})

test('Rejects undefined header value', t => {
  t.deepEqual({ valid: false }, parseContentTypeHeader('whatever', undefined))
  t.deepEqual({ valid: false }, parseAcceptHeader('whatever', undefined))
  t.end()
})
