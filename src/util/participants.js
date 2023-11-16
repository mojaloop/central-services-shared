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

 * Kevin Leyow <kevin.leyow@infitx.com>
 --------------
 ******/

'use strict'

const Logger = require('@mojaloop/central-services-logger')
const Catbox = require('@hapi/catbox')
const CatboxMemory = require('@hapi/catbox-memory')
const Http = require('./http')
const Enum = require('../enums')
const partition = 'participant-cache'
const clientOptions = { partition }
const Mustache = require('mustache')
const request = require('./request')
const ErrorHandler = require('@mojaloop/central-services-error-handling')
const Metrics = require('@mojaloop/central-services-metrics')
const { Map } = require('immutable')

let client
let policy
let switchEndpoint

/**
* @function fetchParticipants
*
* @description This populates the cache of participants
*
* @returns {object} participantMap Returns the object containing the participants
*/
const fetchParticipants = async () => {
  const histTimer = !!Metrics.isInitiated() && Metrics.getHistogram(
    'fetchParticipants',
    'fetchParticipants - Metrics for fetchParticipants',
    ['success']
  ).startTimer()
  try {
    Logger.isDebugEnabled && Logger.debug('participantCache::fetchParticipants := Refreshing participant cache')
    const defaultHeaders = Http.SwitchDefaultHeaders(Enum.Http.HeaderResources.SWITCH, Enum.Http.HeaderResources.PARTICIPANTS, Enum.Http.HeaderResources.SWITCH)
    // The templates have a counter-intuitive naming structure, but this is the correct template to use
    // for a GET /participants request.
    const url = Mustache.render(switchEndpoint + Enum.EndPoints.FspEndpointTemplates.PARTICIPANTS_POST)
    Logger.isDebugEnabled && Logger.debug(`participantCache::fetchParticipants := URL: ${url}`)
    const response = await request.sendRequest(url, defaultHeaders, Enum.Http.HeaderResources.SWITCH, Enum.Http.HeaderResources.SWITCH)
    const participants = response.data
    const participantMap = {}
    if (Array.isArray(participants)) {
      participants.forEach(participant => {
        participantMap[participant.name] = participant
      })
    }
    histTimer({ success: true })
    return participantMap
  } catch (e) {
    histTimer({ success: false })
    Logger.isErrorEnabled && Logger.error(`participantCache::fetchParticipants:: ERROR:'${e}'`)
  }
}

/**
* @function initializeCache
*
* @description This initializes the cache for endpoints
*  @param {object} policyOptions The Endpoint_Cache_Config for the Cache being stored https://hapi.dev/module/catbox/api/?v=12.1.1#policy

* @returns {boolean} Returns true on successful initialization of the cache, throws error on failures
*/
exports.initializeCache = async (policyOptions) => {
  try {
    Logger.isDebugEnabled && Logger.debug(`participantCache::initializeCache::start::clientOptions - ${JSON.stringify(clientOptions)}`)
    client = new Catbox.Client(CatboxMemory, clientOptions)
    await client.start()
    policyOptions.generateFunc = fetchParticipants
    Logger.isDebugEnabled && Logger.debug(`participantCache::initializeCache::start::policyOptions - ${JSON.stringify(policyOptions)}`)
    policy = new Catbox.Policy(policyOptions, client, partition)
    Logger.isDebugEnabled && Logger.debug('participantCache::initializeCache::Cache initialized successfully')
    return true
  } catch (err) {
    console.log(err)
    Logger.isErrorEnabled && Logger.error(`participantCache::Cache error:: ERROR:'${err}'`)
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
  const histTimer = !!Metrics.isInitiated() && Metrics.getHistogram(
    'getParticipant',
    'getParticipant - Metrics for getParticipant with cache hit rate',
    ['success', 'hit']
  ).startTimer()
  switchEndpoint = switchUrl
  Logger.isDebugEnabled && Logger.debug('participantCache::getParticipant')
  let participant
  try {
    // If a service passes in `getDecoratedValue` as true, then an object
    // { value, cached, report } is returned, where value is the cached value,
    // cached is null on a cache miss.
    const participants = await policy.get()
    Logger.isErrorEnabled && Logger.error(JSON.stringify(participants))
    if ('value' in participants && 'cached' in participants) {
      if (participants.cached === null) {
        histTimer({ success: true, hit: false })
      } else {
        histTimer({ success: true, hit: true })
      }
      participant = new Map(participants.value).get(fsp)
    } else {
      participant = new Map(participants).get(fsp)
      histTimer({ success: true, hit: false })
    }
    if (participant) {
      return participant
    } else {
      throw ErrorHandler.Factory.createInternalServerFSPIOPError('Participant does not exist')
    }
  } catch (err) {
    histTimer({ success: false, hit: false })
    Logger.isErrorEnabled && Logger.error(`participantCache::getParticipant:: ERROR:'${err}'`)
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
  }
}

/**
* @function stopCache
*
* @description It stops the cache client
*
* @returns {boolean} - Returns the status
*/
exports.stopCache = async () => {
  Logger.isDebugEnabled && Logger.debug('participantCache::stopCache::Stopping the cache')
  if (client) {
    return client.stop()
  }
}
