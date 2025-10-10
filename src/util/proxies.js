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

 * Eugen Klymniuk <eugen.klymniuk@infitx.com>
 --------------
 **********/

const Mustache = require('mustache')
const Catbox = require('@hapi/catbox')
const CatboxMemory = require('@hapi/catbox-memory')
const ErrorHandler = require('@mojaloop/central-services-error-handling')
const Logger = require('@mojaloop/central-services-logger')
const Metrics = require('@mojaloop/central-services-metrics')

const Enum = require('../enums')
const Http = require('./http')
const request = require('./request')

const partition = 'proxies-cache'
const clientOptions = { partition }
const cacheKey = 'allProxies'

let client
let policy
let switchEndpoint
let hubName
let hubNameRegex

/**
* @function fetchProxies
* @description This populates the cache of proxies
* @returns {array} proxies Returns the list containing proxies
*/
const fetchProxies = async () => {
  const histTimer = Metrics.getHistogram(
    'fetchProxies',
    'fetchProxies - Metrics for fetchProxies',
    ['success']
  ).startTimer()
  try {
    Logger.isDebugEnabled && Logger.debug('proxiesCache::fetchProxies := Refreshing proxies cache')
    if (!hubName || !hubNameRegex) {
      throw Error('No hubName or hubNameRegex! Initialize the cache first.')
    }
    const defaultHeaders = Http.SwitchDefaultHeaders(hubName, Enum.Http.HeaderResources.PARTICIPANTS, hubName)
    const url = Mustache.render(switchEndpoint + Enum.EndPoints.FspEndpointTemplates.PARTICIPANTS_GET_ALL)
    const params = { isProxy: true }
    Logger.isDebugEnabled && Logger.debug(`proxiesCache::fetchProxies := URL: ${url}  QS: ${JSON.stringify(params)}`)
    const response = await request.sendRequest({
      url,
      headers: defaultHeaders,
      source: hubName,
      destination: hubName,
      params,
      hubNameRegex
    })
    const proxies = response.data
    histTimer({ success: true })
    return proxies
  } catch (e) {
    histTimer({ success: false })
    Logger.isErrorEnabled && Logger.error(`proxiesCache::fetchProxies:: ERROR:'${e}'`)
  }
}

/**
* @function initializeCache
*
* @description This initializes the cache for allProxies
* @param {object} policyOptions The Endpoint_Cache_Config for the Cache being stored https://hapi.dev/module/catbox/api/?v=12.1.1#policy
* @param {object} config The config object containing paramters used for the request function
* @returns {boolean} Returns true on successful initialization of the cache, throws error on failures
*/
exports.initializeCache = async (policyOptions, config) => {
  try {
    Logger.isDebugEnabled && Logger.debug(`proxiesCache::initializeCache::start::clientOptions - ${JSON.stringify(clientOptions)}`)
    client = new Catbox.Client(CatboxMemory, clientOptions)
    await client.start()
    policyOptions.generateFunc = fetchProxies
    Logger.isDebugEnabled && Logger.debug(`proxiesCache::initializeCache::start::policyOptions - ${JSON.stringify(policyOptions)}`)
    policy = new Catbox.Policy(policyOptions, client, partition)
    Logger.isDebugEnabled && Logger.debug('proxiesCache::initializeCache::Cache initialized successfully')
    hubName = config.hubName
    hubNameRegex = config.hubNameRegex
    return true
  } catch (err) {
    Logger.isErrorEnabled && Logger.error(`proxiesCache::Cache error:: ERROR:'${err}'`)
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
  }
}

/**
* Returns a list of allProxies names from the cache if the cache is still valid, otherwise it will refresh the cache and return the value
*
* @param {string} switchUrl the endpoint for the switch
* @param {boolean} [onlyActive] if true, returns only active proxies (isActive === 1), defaults to false
* @returns {string[]} - Returns list of allProxies names, throws error if failure occurs
*/
exports.getAllProxiesNames = async (switchUrl, onlyActive = false) => {
  const histTimer = Metrics.getHistogram(
    'getAllProxiesNames',
    'getAllProxiesNames - Metrics for getAllProxies with cache hit rate',
    ['success', 'hit']
  ).startTimer()
  switchEndpoint = switchUrl
  Logger.isDebugEnabled && Logger.debug('proxiesCache::getAllProxiesNames')
  try {
    // If a service passes in `getDecoratedValue` as true, then an object
    // { value, cached, report } is returned, where value is the cached value,
    // cached is null on a cache miss.
    let proxies = await policy.get(cacheKey)

    if ('value' in proxies && 'cached' in proxies) {
      if (proxies.cached === null) {
        histTimer({ success: true, hit: false })
      } else {
        histTimer({ success: true, hit: true })
      }
      proxies = proxies.value
    } else {
      histTimer({ success: true, hit: false })
    }

    if (proxies.errorInformation) {
      // Drop error from cache
      await policy.drop(cacheKey)
      throw ErrorHandler.Factory.createFSPIOPErrorFromErrorInformation(proxies.errorInformation)
    }
    if (onlyActive) {
      proxies = proxies.filter(p => p.isActive === 1)
    }
    return proxies.map(p => p.name)
  } catch (err) {
    histTimer({ success: false, hit: false })
    Logger.isErrorEnabled && Logger.error(`proxiesCache::getAllProxiesNames:: ERROR:'${err}'`)
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
  }
}

/**
* @function invalidateProxiesCache
*
* @description It drops the cache for all proxies
*
* @returns {void}
*/
exports.invalidateProxiesCache = async () => {
  Logger.isDebugEnabled && Logger.debug('proxiesCache::invalidateProxiesCache::Invalidating the cache')
  if (policy) {
    return policy.drop(cacheKey)
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
  Logger.isDebugEnabled && Logger.debug('proxiesCache::stopCache::Stopping the cache')
  if (client) {
    return client.stop()
  }
}
