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

 * ModusBox
 - Georgi Georgiev <georgi.georgiev@modusbox.com>
 - Valentin Genev <valentin.genev@modusbox.com>
 --------------
 ******/
'use strict'

const RC = require('rc')('LIB')
const defaultVersions = require('../enums/http').Headers.DEFAULT_API_VERSIONS
const { API_TYPES, ISO_HEADER_PART } = require('../constants')

const getVersionFromConfig = (resourceString) => {
  const resourceVersionMap = {}
  resourceString
    .split(',')
    .forEach(e => e.split('=')
      .reduce((p, c) => {
        resourceVersionMap[p] = {
          contentVersion: c,
          acceptVersion: c.split('.')[0]
        }
        return null
      }))
  return resourceVersionMap
}

/**
 * Parses resource version string to resource version map
 * @param {*} resourceString string in format: "resouceOneName=1.0,resourceTwoName=1.1"
 */
const parseResourceVersions = (resourceString) => {
  if (!resourceString) return {}
  const resourceFormatRegex = /((([A-Za-z])+)=([0-9]+)([. 0-9]*)(,?))+/
  const noSpResources = resourceString.replace(/\s/g, '')
  const match = noSpResources.match(resourceFormatRegex)
  if (!(match && resourceString === match[0])) {
    throw new Error('Resource versions format should be in format: "resouceOneName=1.0,resourceTwoName=1.1"')
  }
  return getVersionFromConfig(noSpResources)
}

const resourceVersions = {
  ...defaultVersions,
  ...parseResourceVersions(RC.RESOURCE_VERSIONS)
}

const transpose = (obj) => {
  const transposed = new Map()
  for (const prop in obj) {
    transposed[obj[prop]] = prop
  }
  return transposed
}

const isoHeaderPart = apiType => `${apiType === API_TYPES.iso20022 ? `.${ISO_HEADER_PART}` : ''}`

module.exports = {
  isoHeaderPart,
  transpose,
  resourceVersions,
  __parseResourceVersions: parseResourceVersions
}
