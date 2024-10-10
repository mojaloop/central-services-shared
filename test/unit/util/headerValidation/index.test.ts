'use strict';

import Chance from 'chance';
// TODO: this should be parametrised a bit more, and we should test a range of specific, and
// randomly-generated resources
const RESOURCE = 'parties';
import tape from 'tape';
import tapes from 'tapes';
import fs from 'fs';
import path from 'path';
import { getHubNameRegex, generateAcceptRegex, generateContentTypeRegex, convertSupportedVersionToExtensionList, parseAcceptHeader, protocolVersions } from '../../../../src/util/headerValidation/index';
import { generateAcceptHeader, generateAcceptVersions, generateContentTypeHeader, generateContentTypeVersion, validAcceptHeaders, invalidAcceptHeaders, validContentTypeHeaders, invalidContentTypeHeaders } from './support';
const chance = new Chance();
const test = tapes(tape);

// The tests store failures in a file for easier inspection- this is because test failures for
// fuzzing can be large
const saveToTempFile = (data, fname) => {
  const dirPath = fs.mkdtempSync('testfail');
  const fPath = path.join(dirPath, fname);
  fs.writeFileSync(fPath, data);
  return fPath;
};

// The actual regex for the resource we're testing
const acceptRes = generateAcceptRegex(RESOURCE);

test('Run positive accept header test suite', t => {
  const positiveTestSuite = validAcceptHeaders(RESOURCE);
  const failures = positiveTestSuite.filter(h => h.match(acceptRes) === null);
  if (failures.length !== 0) {
    return t.fail(`Positive test suite failed. Failures: \n'${failures.join('\'\n\'')}'.`);
  }
  t.end();
});

test('Run negative accept header test suite', t => {
  const negativeTestSuite = invalidAcceptHeaders(RESOURCE);
  const failures = negativeTestSuite.filter(h => h.match(acceptRes) !== null);
  if (failures.length !== 0) {
    return t.fail(`Negative test suite failed. Failures: \n'${failures.join('\'\n\'')}'.`);
  }
  t.end();
});

test('Run negative accept fuzz', t => {
  // Removed a, A from chance's default string pool. This prevents a chance (the adjective, not
  // the noun) generation of a valid header. We could equally have removed any other letter in
  // the string '/.+abcdeijlnoprstvyABCDEIJLNOPRSTVY', containing each character in a valid
  // version header.
  const pool = 'bcdefghijklmnopqrstuvwxyzBCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()[]';
  const negativeFuzzTestSuite = Array.from({ length: 100000 }, () => chance.string({ pool }) + chance.string());
  const failures = negativeFuzzTestSuite.filter(h => h.match(acceptRes) !== null);
  if (failures.length !== 0) {
    const fname = saveToTempFile('\'' + failures.join('\'\n\'') + '\'', 'negativefuzz');
    return t.fail(`Negative fuzz failed. Failures saved to: ${fname}.`);
  }
  t.end();
});

test('Run positive accept header fuzz', t => {
  const positiveFuzzTestSuite = Array.from({ length: 100000 },
    () => generateAcceptHeader(RESOURCE, generateAcceptVersions()));
  const failures = positiveFuzzTestSuite.filter(h => h.match(acceptRes) === null);
  if (failures.length !== 0) {
    const fname = saveToTempFile('\'' + failures.join('\'\n\'') + '\'', 'positivefuzz');
    return t.fail(`Positive fuzz failed. Failures saved to: ${fname}.`);
  }
  t.end();
});

const contentTypeRes = generateContentTypeRegex(RESOURCE);

test('Run positive content-type header test suite', t => {
  const positiveTestSuite = validContentTypeHeaders(RESOURCE);
  const failures = positiveTestSuite.filter(h => h.match(contentTypeRes) === null);
  if (failures.length !== 0) {
    return t.fail(`Positive test suite failed. Failures: \n'${failures.join('\'\n\'')}'.`);
  }
  t.end();
});

test('Run negative content-type header test suite', t => {
  const negativeTestSuite = invalidContentTypeHeaders(RESOURCE);
  const failures = negativeTestSuite.filter(h => h.match(contentTypeRes) !== null);
  if (failures.length !== 0) {
    return t.fail(`Negative test suite failed. Failures: \n'${failures.join('\'\n\'')}'.`);
  }
  t.end();
});

test('Run negative content-type header fuzz', t => {
  // Removed a, A from chance's default string pool. This prevents a chance (the adjective, not
  // the noun) generation of a valid header. We could equally have removed any other letter in
  // the string '/.+abcdeijlnoprstvyABCDEIJLNOPRSTVY', containing each character in a valid
  // version header.
  const pool = 'bcdefghijklmnopqrstuvwxyzBCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()[]';
  const negativeFuzzTestSuite = Array.from({ length: 100000 }, () => chance.string({ pool }) + chance.string());
  const failures = negativeFuzzTestSuite.filter(h => h.match(contentTypeRes) !== null);
  if (failures.length !== 0) {
    const fname = saveToTempFile('\'' + failures.join('\'\n\'') + '\'', 'negativefuzz');
    return t.fail(`Negative fuzz failed. Failures saved to: ${fname}.`);
  }
  t.end();
});

test('Run positive content-type header fuzz', t => {
  const positiveFuzzTestSuite = Array.from({ length: 100000 },
    () => generateContentTypeHeader(RESOURCE, generateContentTypeVersion()));
  const failures = positiveFuzzTestSuite.filter(h => h.match(contentTypeRes) === null);
  if (failures.length !== 0) {
    const fname = saveToTempFile('\'' + failures.join('\'\n\'') + '\'', 'positivefuzz');
    return t.fail(`Positive fuzz failed. Failures saved to: ${fname}.`);
  }
  t.end();
});

test('Run test-case 1 for convertSupportedVersionToExtensionList', t => {
  const supportedVersionList = [
    '1',
    '1.0',
    '1.1'
  ];
  const expectedResult = [
    { key: '1', value: '0' },
    { key: '1', value: '1' }
  ];
  const result = convertSupportedVersionToExtensionList(supportedVersionList);
  t.deepEqual(result, expectedResult);
  t.end();
});

test('Run test-case 2 for convertSupportedVersionToExtensionList', t => {
  const supportedVersionList = [
    '1.',
    '1.0',
    '1.1'
  ];
  const expectedResult = [
    { key: '1', value: '0' },
    { key: '1', value: '1' }
  ];
  const result = convertSupportedVersionToExtensionList(supportedVersionList);
  t.deepEqual(result, expectedResult);
  t.end();
});

test('Run test-case 3 for convertSupportedVersionToExtensionList', t => {
  const supportedVersionList = [];
  const expectedResult = [];
  const result = convertSupportedVersionToExtensionList(supportedVersionList);
  t.deepEqual(result, expectedResult);
  t.end();
});

test('Run test-case 4 for convertSupportedVersionToExtensionList', t => {
  const supportedVersionList = [
    2,
    2.0,
    3.1,
    '1.0'
  ];
  const expectedResult = [
    { key: '2', value: '0' },
    { key: '3', value: '1' },
    { key: '1', value: '0' }
  ];
  const result = convertSupportedVersionToExtensionList(supportedVersionList);
  t.deepEqual(result, expectedResult);
  t.end();
});

test('Run test-case 4 for convertSupportedVersionToExtensionList', t => {
  const supportedVersionList = [
    2,
    2.0,
    3.1,
    '1.0',
    protocolVersions.anyVersion
  ];
  const expectedResult = [
    { key: '2', value: '0' },
    { key: '3', value: '1' },
    { key: '1', value: '0' }
  ];
  const result = convertSupportedVersionToExtensionList(supportedVersionList);
  t.deepEqual(result, expectedResult);
  t.end();
});

test('Run test-case for parseAcceptHeader', t => {
  const resource = 'participants';
  const acceptHeader = `application/vnd.interoperability.${resource}+json;version=1,application/vnd.interoperability.${resource}+json;version=1.1`;
  const expectedResult = {
    valid: true,
    versions: new Set([
      '1',
      '1.1'
    ])
  };
  const result = parseAcceptHeader(resource, acceptHeader);
  t.deepEqual(result, expectedResult);
  t.end();
});

test('Run test-case for getHubNameRegex', t => {
  const result = getHubNameRegex('Hub');
  const cache = getHubNameRegex('Hub2');

  t.ok(result instanceof RegExp);
  // Check if the cache is used
  t.equal(result, cache);
  t.end();
});
