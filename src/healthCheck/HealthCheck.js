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

 * Lewis Daly <lewis@vesselstech.com>
 --------------
 ******/

'use strict'

const {
  statusEnum
} = require('./HealthCheckEnums')
const Logger = require('@mojaloop/central-services-logger').createLogger()

/**
 * @class HealthCheck
 *
 *
 * HealthCheck is a common class for handling health checks across multiple projects. If you wish to test
 * subservices as part of your health check, create a new HealthCheck, and pass in an array of serviceChecks.
 *
 * @example
 * //Construct a new HealthCheck, and pass through a package.json, and List of ServiceCheckerFuncs
 *
 * const packageJson = require('../package.json')
 * const serviceChecks = [
 *   //Implement these methods
 *   () => Promise.resolve({status: statusEnum.OK, service: serviceName.datastore }),
 *   () => Promise.resolve({status: statusEnum.OK, service: serviceName.broker }),
 * ]
 * const healthCheck = new HealthCheck(packageJson, serviceChecks)
 * const health = await healthCheck.getHealth()
 *
 */
class HealthCheck {
  /**
   * SubServiceHealth
   * @typedef SubServiceHealth An object describing the health of a sub-service
   * @property {StatusEnum} status The status of the service. See HealthCheckEnums.js
   * @property {ServiceName} service The name of the service. See HealthCheckEnums.js
   */

  /**
   * A function that checks the health of a service
   * @typedef {ServiceCheckerFunc} ServiceCheckerFunc
   * @returns {Promise<SubServiceHealth>} SubService health check object
   *
   * @example
   * () => {
   *   return Promise.resolve({status: statusEnum.OK, service: serviceName.datastore })
   * }
   */

  /**
   * @function constructor
   *
   * @param {object} packageJson A standard package.json file
   * @param {object.version} version The version code of the package.json file
   * @param {ServiceCheckerFunc[]} serviceChecks An array of ServiceCheckerFunctions
   */
  constructor (packageJson, serviceChecks) {
    this.packageJson = packageJson
    this.serviceChecks = serviceChecks

    this.getHealth = this.getHealth.bind(this)
  }

  /**
   * @function getHealth
   *
   * @description Gets the health of the service along with sub-services
   *
   */
  async getHealth (context = undefined) {
    // Default values
    let status = statusEnum.OK
    let isHealthy = true
    let subServices = {}

    const uptime = process.uptime() // in seconds by default
    const startTimeDate = new Date(Date.now() - uptime)
    const startTime = startTimeDate.toISOString()
    const versionNumber = this.packageJson.version

    try {
      const services = await Promise.all(this.serviceChecks.map(s => s(context)))
      isHealthy = HealthCheck.evaluateServiceHealth(services)
      subServices = {
        services
      }
    } catch (err) {
      Logger.isErrorEnabled && Logger.error(`HealthCheck.getSubServiceHealth failed with error: ${err.message}`)
      isHealthy = false
    }

    if (!isHealthy) {
      status = statusEnum.DOWN
    }

    return {
      status,
      uptime,
      startTime,
      versionNumber,
      ...subServices
    }
  }

  /**
   * @function evaluateServiceHealth
   *
   * @description
   * Evaluate the health based on the SubService health array
   * if any service.status is DOWN, then the entire service
   * is considered unhealthy (will return false)
   *
   * @param {Array<Service>} services - A list of the services to evaluate
   *
   */
  static evaluateServiceHealth (services) {
    return services.reduce((acc, curr) => {
      if (!acc) {
        return acc
      }
      if (curr.status === statusEnum.DOWN) {
        return false
      }

      return acc
    }, true)
  }
}

module.exports = HealthCheck
