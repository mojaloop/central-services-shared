'use strict'

const assert = require('assert').strict
const _ = require('lodash')
const { API_TYPES } = require('../../constants')
const { isoHeaderPart } = require('../helpers')

const protocolVersions = {
  anyVersion: Symbol('Any'),
  ONE: ['1', '1.0', '1.1'],
  TWO: ['2', '2.0']
}

const protocolVersionsMap = [
  { key: '1', value: '0' },
  { key: '1', value: '1' },
  { key: '2', value: '0' }
]

// Some convenience functions for generating regexes for header matching

const generateContentTypeRegex = (resource, apiType) =>
  new RegExp(`^application/vnd\\.interoperability${isoHeaderPart(apiType)}\\.${resource}\\+json\\s{0,1};\\s{0,1}version=(\\d+\\.\\d+)$`)

const generateAcceptRegex = (resource, apiType) =>
  new RegExp(`^${generateSingleAcceptRegexStr(resource, apiType)}(,${generateSingleAcceptRegexStr(resource, apiType)})*$`)

const generateSingleAcceptRegex = (resource, apiType) =>
  new RegExp(generateSingleAcceptRegexStr(resource, apiType))

const generateSingleAcceptRegexStr = (resource, apiType) =>
  `application/vnd\\.interoperability${isoHeaderPart(apiType)}\\.${resource}\\+json(\\s{0,1};\\s{0,1}version=\\d+(\\.\\d+)?)?`

const checkApiType = (apiType) => {
  if (Object.values(API_TYPES).includes(apiType)) {
    return true
  }
  throw new TypeError(`Invalid API type: ${apiType}`)
}

const parseContentTypeHeader = (resource, header, apiType = API_TYPES.fspiop) => {
  assert(typeof header === 'string')

  // Create the validation regex
  const r = generateContentTypeRegex(resource, apiType)

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

const parseAcceptHeader = (resource, header, apiType = API_TYPES.fspiop) => {
  assert(typeof header === 'string')

  // Create the validation regex
  const r = generateAcceptRegex(resource, apiType)

  // Test the header
  if (header.match(r) === null) {
    return { valid: false }
  }

  // The header contains a comma-delimited set of versions, extract these
  const versions = new Set(header
    .split(',')
    .map(verStr => verStr.match(generateSingleAcceptRegex(resource, apiType))[1])
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

let hubNameRegex

const escapeRegexInput = (str) => {
  return str.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')
}

const getHubNameRegex = (hubName) => {
  // @note: we do not expect hubName to change during runtime
  // so we can cache the regex
  if (!hubNameRegex) {
    const regexStr = String.raw`^${escapeRegexInput(hubName)}$`
    hubNameRegex = new RegExp(regexStr, 'i')
  }
  return hubNameRegex
}

module.exports = {
  protocolVersions,
  protocolVersionsMap,
  getHubNameRegex,
  generateAcceptRegex,
  generateContentTypeRegex,
  parseAcceptHeader,
  parseContentTypeHeader,
  checkApiType,
  convertSupportedVersionToExtensionList
}
