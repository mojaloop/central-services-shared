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
 * Name Surname <name.surname@gatesfoundation.com>

 * ModusBox
 - Georgi Georgiev <georgi.georgiev@modusbox.com>
 --------------
 ******/
'use strict'

require('dotenv').config()
const { from } = require('env-var');

/**
     * Gets Resources versions from enviromental variable RESOURCES_VERSIONS
     * should be string in format: "resouceOneName=1.0,resourceTwoName=1.1"
     */
const getVersionFromConfig = (resourceString) => {
  const resourceVersionMap = {};
  resourceString
    .split(',')
    .forEach(e => e.split('=')
      .reduce((p, c) => {
        resourceVersionMap[p] = {
          contentVersion: c,
          acceptVersion: c.split('.')[0]
        }
      }))
  return resourceVersionMap
}

const parseResourceVersions = (resourceString) => {
  if (!resourceString) return {}
  const resourceFormatRegex = /(([A-Za-z])\w*)=([0-9]+).([0-9]+)([^;:|],*)/g
  const noSpResources = resourceString.replace(/\s/g, '')
  if (!resourceFormatRegex.test(noSpResources)) {
    throw new Error('Resource versions format should be in format: "resouceOneName=1.0,resourceTwoName=1.1"')
  }
  return getVersionFromConfig(noSpResources)
}

const env = from(process.env, {
  asResourceVersions: (resourceString) => parseResourceVersions(resourceString)
})

const resourceVersions = env.get('RESOURCE_VERSIONS').default('').asResourceVersions()

const transpose = (obj) => {
  const transposed = new Map()
  for (const prop in obj) {
    transposed[obj[prop]] = prop
  }
  return transposed
}

module.exports = {
  transpose,
  resourceVersions,
  __parseResourceVersions: parseResourceVersions
}
