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

const Redis = require('ioredis')
const { createLogger } = require('../createLogger')
const { REDIS_SUCCESS, REDIS_IS_CONNECTED_STATUSES } = require('../../constants')
const isClusterConfig = (config) => { return 'cluster' in config }
const { rethrowRedisError } = require('../rethrow')

class RedisCache {
  constructor (config, client) {
    this.config = config
    this.isCluster = isClusterConfig(config)
    this.log = createLogger(this.constructor.name)
    /* istanbul ignore next */
    this.redisClient = client || this.createRedisClient()
    this.addEventListeners(this.redisClient)
  }

  /* istanbul ignore next */
  createRedisClient () {
    this.config.lazyConnect ??= true
    const redisClient = isClusterConfig(this.config)
      ? new Redis.Cluster(this.config.cluster, this.config)
      : new Redis(this.config)

    return redisClient
  }

  /* istanbul ignore next */
  addEventListeners (redisClient) {
    const { log } = this
    redisClient
      .on('error', (err) => { log.error('redis connection error', err) })
      .on('close', () => { log.info('redis connection closed') })
      .on('end', () => { log.warn('redis connection ended') })
      .on('reconnecting', (ms) => { log.info('redis connection reconnecting', { ms }) })
      .on('connect', () => { log.verbose('redis connection is established') })
      .on('ready', () => { log.verbose('redis connection is ready') })
  }

  async connect () {
    if (this.isConnected) {
      this.log.warn('proxyCache is already connected')
      return true
    }
    await this.redisClient.connect()
    const { status } = this.redisClient
    this.log.verbose('proxyCache is connected', { status })
    return true
  }

  async disconnect () {
    const response = await this.redisClient.quit()
    const isDisconnected = response === REDIS_SUCCESS
    this.redisClient.removeAllListeners()
    this.log.info('proxyCache is disconnected', { isDisconnected, response })
    return isDisconnected
  }

  async healthCheck () {
    try {
      const response = await this.redisClient.ping()
      const isHealthy = response === 'PONG'
      this.log.debug('healthCheck ping response', { isHealthy, response })
      return isHealthy
    } catch (err) {
      this.log.warn('healthCheck error', err)
      return false
    }
  }

  get isConnected () {
    const isConnected = REDIS_IS_CONNECTED_STATUSES.includes(this.redisClient.status)
    this.log.debug('isConnected', { isConnected })
    return isConnected
  }

  async get (key) {
    try {
      return await this.redisClient.get(key)
    } catch (err) {
      this.log.error('Error getting key from Redis:', err)
      rethrowRedisError(err)
    }
  }

  async set (key, value, ttl) {
    try {
      if (ttl) {
        await this.redisClient.set(key, value, 'EX', ttl)
      } else {
        await this.redisClient.set(key, value)
      }
    } catch (err) {
      this.log.error('Error setting key in Redis:', err)
      rethrowRedisError(err)
    }
  }

  async delete (key) {
    try {
      await this.redisClient.del(key)
    } catch (err) {
      this.log.error('Error deleting key from Redis:', err)
      rethrowRedisError(err)
    }
  }

  async clearCache () {
    try {
      const keys = await this.redisClient.keys('*')
      const pipeline = this.redisClient.pipeline()
      keys.forEach(key => pipeline.del(key))
      await pipeline.exec()
    } catch (err) {
      this.log.error('Error clearing Redis cache:', err)
      rethrowRedisError(err)
    }
  }
}

module.exports = RedisCache
