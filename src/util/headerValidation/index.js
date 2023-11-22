'use strict'

const assert = require('assert').strict
const _ = require('lodash')

const protocolVersions = {
  anyVersion: Symbol('Any'),
  ONE: ['1', '1.0', '1.1'],
  TWO: ['2', '2.0']
}

const protocolVersionsMap = [
  { key: '1', value: '0' },
  { key: '1', value: '1' }
]

// Some convenience functions for generating regexes for header matching

const generateContentTypeRegex = resource =>
  new RegExp(`^application/vnd\\.interoperability\\.${resource}\\+json\\s{0,1};\\s{0,1}version=(\\d+\\.\\d+)$`)

const generateAcceptRegex = resource =>
  new RegExp(`^${generateSingleAcceptRegexStr(resource)}(,${generateSingleAcceptRegexStr(resource)})*$`)

const generateSingleAcceptRegex = resource =>
  new RegExp(generateSingleAcceptRegexStr(resource))

const generateSingleAcceptRegexStr = resource =>
  `application/vnd\\.interoperability\\.${resource}\\+json(\\s{0,1};\\s{0,1}version=\\d+(\\.\\d+)?)?`

const parseContentTypeHeader = (resource, header) => {
  assert(typeof header === 'string')

  // Create the validation regex
  const r = generateContentTypeRegex(resource)

  // Test the header
  const match = header.match(r)
  if (match === null) {
    return { valid: false }
  }

  return {
    valid: true,
    version: match[1]
  }
}

const parseAcceptHeader = (resource, header) => {
  assert(typeof header === 'string')

  // Create the validation regex
  const r = generateAcceptRegex(resource)

  // Test the header
  if (header.match(r) === null) {
    return { valid: false }
  }

  // The header contains a comma-delimited set of versions, extract these
  const versions = new Set(header
    .split(',')
    // @ts-ignore
    .map(verStr => verStr.match(generateSingleAcceptRegex(resource))[1])
    .map(match => match === undefined ? protocolVersions.anyVersion : match.split('=')[1])
  )

  return {
    valid: true,
    versions
  }
}

const convertSupportedVersionToExtensionList = (supportedVersions) => {
  const supportedVersionsExtensionListMap = []
  for (const version of supportedVersions) {
    const versionList = version.toString().split('.').filter(num => num !== '')
    if (versionList != null && versionList.length === 2) {
      const versionMap = {}
      versionMap.key = versionList[0]
      versionMap.value = versionList[1]
      supportedVersionsExtensionListMap.push(versionMap)
    } else if (versionList != null && versionList.length === 1 && version !== protocolVersions.anyVersion) {
      const versionMap = {}
      versionMap.key = versionList[0]
      versionMap.value = '0'
      supportedVersionsExtensionListMap.push(versionMap)
    }
  }
  return _.uniqWith(supportedVersionsExtensionListMap, _.isEqual)
}

module.exports = {
  protocolVersions,
  protocolVersionsMap,
  generateAcceptRegex,
  generateContentTypeRegex,
  parseAcceptHeader,
  parseContentTypeHeader,
  convertSupportedVersionToExtensionList
}
