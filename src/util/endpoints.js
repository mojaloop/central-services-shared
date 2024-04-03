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

 * Shashikant Hirugade <shashikant.hirugade@modusbox.com>
 * Rajiv Mothilal <rajiv.mothilal@modusbox.com>
 --------------
 ******/

'use strict'

const Logger = require('@mojaloop/central-services-logger')
const ErrorHandler = require('@mojaloop/central-services-error-handling')
const Catbox = require('@hapi/catbox')
const CatboxMemory = require('@hapi/catbox-memory')
const Mustache = require('mustache')
const { Map } = require('immutable')
const Enum = require('../enums')
const Http = require('./http')
const request = require('./request')
const partition = 'endpoint-cache'
const clientOptions = { partition }
const Metrics = require('@mojaloop/central-services-metrics')

let client
let policy
let switchEndpoint

/**
 * @function fetchEndpoints
 *
 * @description This populates the cache of endpoints
 *
 * @param {string} fsp The fsp id
 * @returns {object} endpointMap Returns the object containing the endpoints for given fsp id
 */
const fetchEndpoints = async (fsp) => {
  const histTimer = !!Metrics.isInitiated() && Metrics.getHistogram(
    'fetchParticipants',
    'fetchParticipants - Metrics for fetchParticipants',
    ['success']
  ).startTimer()
  try {
    Logger.isDebugEnabled && Logger.debug(`[fsp=${fsp}] ~ participantEndpointCache::fetchEndpoints := Refreshing the cache for FSP: ${fsp}`)
    const defaultHeaders = Http.SwitchDefaultHeaders(Enum.Http.HeaderResources.SWITCH, Enum.Http.HeaderResources.PARTICIPANTS, Enum.Http.HeaderResources.SWITCH)
    const url = Mustache.render(switchEndpoint + Enum.EndPoints.FspEndpointTemplates.PARTICIPANT_ENDPOINTS_GET, { fsp })
    Logger.isDebugEnabled && Logger.debug(`[fsp=${fsp}] ~ participantEndpointCache::fetchEndpoints := URL for FSP: ${url}`)
    const response = await request.sendRequest(url, defaultHeaders, Enum.Http.HeaderResources.SWITCH, Enum.Http.HeaderResources.SWITCH)
    Logger.isDebugEnabled && Logger.debug(`[fsp=${fsp}] ~ Model::participantEndpoint::fetchEndpoints := successful with body: ${JSON.stringify(response.data)}`)
    const endpoints = response.data
    const endpointMap = {}
    if (Array.isArray(endpoints)) {
      endpoints.forEach(item => {
        Mustache.parse(item.value)
        endpointMap[item.type] = item.value
      })
    }
    Logger.isDebugEnabled && Logger.debug(`[fsp=${fsp}] ~ participantEndpointCache::fetchEndpoints := Returning the endpoints: ${JSON.stringify(endpointMap)}`)
    histTimer({ success: true })
    return endpointMap
  } catch (e) {
    histTimer({ success: false })
    Logger.isErrorEnabled && Logger.error(`participantEndpointCache::fetchEndpoints:: ERROR:'${e}'`)
  }
}

/**
 * @module src/domain/participant/lib/cache
 */

/**
 * @function initializeCache
 *
 * @description This initializes the cache for endpoints
 *  @param {object} policyOptions The Endpoint_Cache_Config for the Cache being stored https://hapi.dev/module/catbox/api/?v=12.1.1#policy

 * @returns {boolean} Returns true on successful initialization of the cache, throws error on failures
 */
exports.initializeCache = async (policyOptions) => {
  try {
    Logger.isDebugEnabled && Logger.debug(`participantEndpointCache::initializeCache::start::clientOptions - ${JSON.stringify(clientOptions)}`)
    client = new Catbox.Client(CatboxMemory, clientOptions)
    await client.start()
    policyOptions.generateFunc = fetchEndpoints
    Logger.isDebugEnabled && Logger.debug(`participantEndpointCache::initializeCache::start::policyOptions - ${JSON.stringify(policyOptions)}`)
    policy = new Catbox.Policy(policyOptions, client, partition)
    Logger.isDebugEnabled && Logger.debug('participantEndpointCache::initializeCache::Cache initialized successfully')
    return true
  } catch (err) {
    Logger.isErrorEnabled && Logger.error(`participantEndpointCache::Cache error:: ERROR:'${err}'`)
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
  }
}

/**
 * @function getEndpoint
 *
 * @description It returns the endpoint for a given fsp and type from the cache if the cache is still valid, otherwise it will refresh the cache and return the value
 *
 * @param {string} switchUrl the endpoint for the switch
 * @param {string} fsp - the id of the fsp
 * @param {string} endpointType - the type of the endpoint
 * @param {object} options - contains the options for the mustache template function
 *
 * @returns {string} - Returns the endpoint, throws error if failure occurs
 */
exports.getEndpoint = async (switchUrl, fsp, endpointType, options = {}, renderOptions = {}) => {
  const histTimer = !!Metrics.isInitiated() && Metrics.getHistogram(
    'getEndpoint',
    'getEndpoint - Metrics for getEndpoint with cache hit rate',
    ['success', 'hit']
  ).startTimer()
  switchEndpoint = switchUrl
  Logger.isDebugEnabled && Logger.debug(`participantEndpointCache::getEndpoint::endpointType - ${endpointType}`)
  try {
    // If a service passes in `getDecoratedValue` as true, then an object
    // { value, cached, report } is returned, where value is the cached value,
    // cached is null on a cache miss.
    const endpoints = await policy.get(fsp)
    if ('value' in endpoints && 'cached' in endpoints) {
      if (endpoints.cached === null) {
        histTimer({ success: true, hit: false })
      } else {
        histTimer({ success: true, hit: true })
      }
      const endpoint = new Map(endpoints.value).get(endpointType)
      if (renderOptions.path) {
        const renderedEndpoint = (endpoint === undefined) ? endpoint : endpoint + renderOptions.path
        return Mustache.render(renderedEndpoint, options)
      }
      return Mustache.render(endpoint, options)
    }
    let endpoint = new Map(endpoints).get(endpointType)
    if (renderOptions.path) {
      endpoint = (endpoint === undefined) ? endpoint : endpoint + renderOptions.path
    }
    histTimer({ success: true, hit: false })
    return Mustache.render(endpoint, options)
  } catch (err) {
    histTimer({ success: false, hit: false })
    Logger.isErrorEnabled && Logger.error(`participantEndpointCache::getEndpoint:: ERROR:'${err}'`)
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
  }
}

/**
 * @function getEndpointAndRender
 *
 * @description It returns the rendered endpoint for a given fsp and type from the cache if the cache is still valid, otherwise it will refresh the cache and return the value
 *
 * @param {string} switchUrl the endpoint for the switch
 * @param {string} fsp - the id of the fsp
 * @param {string} endpointType - the type of the endpoint
 * @param {string} path - callback endpoint path
 * @param {object} options - contains the options for the mustache template function
 *
 * @returns {string} - Returns the rendered endpoint, throws error if failure occurs
 */
exports.getEndpointAndRender = async (switchUrl, fsp, endpointType, path = '', options) => {
  const histTimer = !!Metrics.isInitiated() && Metrics.getHistogram(
    'getEndpointAndRender',
    'getEndpoint - Metrics for getEndpointAndRender',
    ['success']
  ).startTimer()
  switchEndpoint = switchUrl
  Logger.isDebugEnabled && Logger.debug(`participantEndpointCache::getEndpointAndRender::endpointType - ${endpointType}`)

  try {
    const endpoint = exports.getEndpoint(switchUrl, fsp, endpointType, options, { path })
    histTimer({ success: true })
    return endpoint
  } catch (err) {
    histTimer({ success: false })
    Logger.isErrorEnabled && Logger.error(`participantEndpointCache::getEndpointAndRender:: ERROR:'${err}'`)
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
  Logger.isDebugEnabled && Logger.debug('participantEndpointCache::stopCache::Stopping the cache')
  if (client) {
    return client.stop()
  }
}
