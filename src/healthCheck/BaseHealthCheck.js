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
 - Name Surname <name.surname@gatesfoundation.com>

 * Lewis Daly <lewis@vesselstech.com>
 --------------
 ******/

'use strict'

const {
  statusEnum
} = require('./HealthCheckEnums')
const Logger = require('../logger')

/**
 * @class BaseHealthCheck
 *
 *
 * BaseHealthCheck is a common class for handling health checks across multiple projects. If you wish to test
 * subservices, extend BaseHealthCheck and implement the required methods.
 *
 * @example
 *  // Extend the BaseHealthCheck class, and implement the required getSubServiceHealth<serviceName> methods.
 *
 *  class HealthCheck extends BaseHealthCheck {
 *
 *     async getSubServiceHealthDatastore() {
 *       // implement for this service
 *     }
 *
 *     async getSubServiceHealthBroker() {
 *       // implement for this service
 *     }
 *   }
 *
 *
 *
 */
class BaseHealthCheck {
  constructor (packageJson, servicesToCheck) {
    this.packageJson = packageJson
    this.servicesToCheck = servicesToCheck

    this.getHealth = this.getHealth.bind(this)
    this.getSubServiceHealth = this.getSubServiceHealth.bind(this)
  }

  /**
   * @function getHealth
   *
   * @description Gets the health of the service along with sub-services
   *
   */
  async getHealth () {
    // Default values
    let status = statusEnum.OK
    let isHealthy = true
    let subServices = {}

    const uptime = process.uptime() // in seconds by default
    const startTimeDate = new Date(Date.now() - uptime)
    const startTime = startTimeDate.toISOString()
    const versionNumber = this.packageJson.version

    try {
      const services = await Promise.all(this.servicesToCheck.map(s => this.getSubServiceHealth(s)))

      isHealthy = BaseHealthCheck.evaluateServiceHealth(services)
      subServices = {
        services
      }
    } catch (err) {
      Logger.error(`HealthCheck.getSubServiceHealth failed with error: ${err.message}`)
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
   * @function getSubServiceHealth
   *
   * @description Get the health of a given sub-service
   *
   * @param {serviceEnum} serviceName - the name of the service be checked. See `HealthCheckEnums.js`
   */
  async getSubServiceHealth (serviceName) {
    switch (serviceName) {
      case 'datastore': return this.getSubServiceHealthDatastore()
      case 'broker': return this.getSubServiceHealthBroker()
      default: {
        throw new Error(`Service: ${serviceName} not found.`)
      }
    }
  }

  async getSubServiceHealthDatastore () {
    throw new Error('Abstract method getSubServiceHealthDatastore not implemented')
  }

  async getSubServiceHealthBroker () {
    throw new Error('Abstract method getSubServiceHealthBroker not implemented')
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

module.exports = BaseHealthCheck