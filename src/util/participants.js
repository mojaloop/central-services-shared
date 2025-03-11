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

 * Kevin Leyow <kevin.leyow@infitx.com>
 --------------
 ******/

'use strict'

const ErrorHandler = require('@mojaloop/central-services-error-handling')
const Metrics = require('@mojaloop/central-services-metrics')
const Catbox = require('@hapi/catbox')
const CatboxMemory = require('@hapi/catbox-memory')
const Mustache = require('mustache')

const logger = require('../logger').logger.child({ component: 'participantCache' })
const Enum = require('../enums')
const Http = require('./http')
const request = require('./request')

const partition = 'participant-cache'
const clientOptions = { partition }

let client
let policy
let switchEndpoint
let hubName
let hubNameRegex

/**
* @function fetchParticipant
*
* @param {string} fsp The fsp id
* @param {object} options The options for the request function
* @description This populates the cache of participants
*
* @returns {object} participant Returns the object containing the participants
*/
const fetchParticipant = async (fsp) => {
  const histTimer = Metrics.getHistogram(
    'fetchParticipant',
    'fetchParticipant - Metrics for fetchParticipant',
    ['success']
  ).startTimer()
  const log = logger.child({ fsp, method: 'fetchParticipant' })

  try {
    log.debug('refreshing participant cache', { hubName })
    if (!hubName) {
      throw Error('"hubName" is not initialized. Initialize the cache first.')
    }
    if (!hubNameRegex) {
      throw Error('"hubNameRegex" is not initialized. Initialize the cache first.')
    }
    const defaultHeaders = Http.SwitchDefaultHeaders(hubName, Enum.Http.HeaderResources.PARTICIPANTS, hubName)
    const url = Mustache.render(switchEndpoint + Enum.EndPoints.FspEndpointTemplates.PARTICIPANTS_GET, { fsp })
    log.verbose('url for PARTICIPANTS_GET', { url })

    const response = await request.sendRequest({
      url,
      headers: defaultHeaders,
      source: hubName,
      destination: hubName,
      hubNameRegex
    })
    const participant = response.data
    log.verbose('returning the participant', { participant })
    histTimer({ success: true })

    return participant
  } catch (err) {
    histTimer({ success: false })
    // We're logging this as a "warning" rather than "error" because the participant might be a proxied participant
    log.warn(`error in fetchParticipants: ${err?.message}'`, err)
  }
}

/**
* @function initializeCache
*
* @description This initializes the cache for endpoints
* @param {object} policyOptions The Endpoint_Cache_Config for the Cache being stored https://hapi.dev/module/catbox/api/?v=12.1.1#policy
* @param {object} config The config object containing paramters used for the request function
* @returns {boolean} Returns true on successful initialization of the cache, throws error on failures
*/
exports.initializeCache = async (policyOptions, config) => {
  try {
    logger.debug('participantCache::initializeCache start', { clientOptions, policyOptions })
    client = new Catbox.Client(CatboxMemory, clientOptions)
    await client.start()
    policyOptions.generateFunc = fetchParticipant
    policy = new Catbox.Policy(policyOptions, client, partition)
    hubName = config.hubName
    hubNameRegex = config.hubNameRegex
    logger.verbose('participantCache::initializeCache is done', { hubName })
    return true
  } catch (err) {
    logger.error(`error in participantCache::initializeCache: ${err?.message}`, err)
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
  }
}

/**
* @function getParticipant
*
* @description It returns the participant data for a given fsp and type from the cache if the cache is still valid, otherwise it will refresh the cache and return the value
*
* @param {string} switchUrl the endpoint for the switch
* @param {string} fsp - the id of the fsp
*
* @returns {string} - Returns the endpoint, throws error if failure occurs
*/
exports.getParticipant = async (switchUrl, fsp) => {
  const histTimer = Metrics.getHistogram(
    'getParticipant',
    'getParticipant - Metrics for getParticipant with cache hit rate',
    ['success', 'hit']
  ).startTimer()
  switchEndpoint = switchUrl
  const log = logger.child({ fsp, method: 'getParticipant' })
  log.debug('getParticipant start', { switchUrl })
  try {
    // If a service passes in `getDecoratedValue` as true, then an object
    // { value, cached, report } is returned, where value is the cached value,
    // cached is null on a cache miss.
    let participant = await policy.get(fsp)

    if ('value' in participant && 'cached' in participant) {
      histTimer({ success: true, hit: participant.cached !== null })
      participant = participant.value
    } else {
      histTimer({ success: true, hit: false })
    }

    /* istanbul ignore next */
    if (!participant) {
      log.warn('no participant found')
      return null
    }
    log.verbose('getParticipant result:', { participant })

    if (participant.errorInformation) {
      // Drop error from cache
      await policy.drop(fsp)
      throw ErrorHandler.Factory.createFSPIOPErrorFromErrorInformation(participant.errorInformation)
    }
    return participant
  } catch (err) {
    histTimer({ success: false, hit: false })
    log.error(`error in getParticipant: ${err?.message}`, err)
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
  }
}

/**
* @function invalidateParticipantCache
*
* @description It drops the cache for a given participant by fspId
*
* @returns {void}
*/
/* istanbul ignore next */
exports.invalidateParticipantCache = async (fsp) => {
  logger.verbose('participantCache invalidateParticipantCache')
  if (policy) {
    return policy.drop(fsp)
  }
}

/**
* @function stopCache
*
* @description It stops the cache client
*
* @returns {boolean} - Returns the status
*/
/* istanbul ignore next */
exports.stopCache = async () => {
  logger.verbose('participantCache stopCache')
  if (client) {
    return client.stop()
  }
}
