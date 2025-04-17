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

 * Kevin Leyow <kevin.leyow@modusbox.com>

 --------------
 ******/

'use strict'
const Redis = require('ioredis')
const { createLogger } = require('../index')
const isClusterConfig = (config) => { return 'cluster' in config }
const { rethrowRedisError } = require('../rethrow')
const { REDIS_SUCCESS, REDIS_IS_CONNECTED_STATUSES } = require('../../constants')

class PubSub {
  constructor (config, publisherClient, subscriberClient) {
    this.config = config
    this.isCluster = isClusterConfig(config)
    this.log = createLogger(this.constructor.name)
    this.publisherClient = publisherClient || this.createRedisClient()
    this.subscriberClient = subscriberClient || this.createRedisClient()
    this.addEventListeners(this.publisherClient)
    this.addEventListeners(this.subscriberClient)
  }

  createRedisClient () {
    this.config.lazyConnect ??= true
    return this.isCluster
      ? new Redis.Cluster(this.config.cluster, this.config)
      : new Redis(this.config)
  }

  async connect () {
    try {
      await this.publisherClient.connect()
      await this.subscriberClient.connect()
      this.log.info('Redis clients connected successfully')
    } catch (err) {
      this.log.error('Error connecting Redis clients:', err)
      rethrowRedisError(err)
    }
  }

  async disconnect () {
    try {
      const publisherResponse = await this.publisherClient.quit()
      const subscriberResponse = await this.subscriberClient.quit()
      const isDisconnected = publisherResponse === REDIS_SUCCESS && subscriberResponse === REDIS_SUCCESS
      this.subscriberClient.removeAllListeners()
      this.log.info('Redis clients disconnected successfully')
      return isDisconnected
    } catch (err) {
      this.log.error('Error disconnecting Redis clients:', err)
      rethrowRedisError(err)
    }
  }

  async healthCheck () {
    try {
      const publisherStatus = await this.publisherClient.ping()
      const subscriberStatus = await this.subscriberClient.ping()
      const isHealthy = publisherStatus === 'PONG' && subscriberStatus === 'PONG'
      this.log.debug(`Redis health check: ${isHealthy ? 'Healthy' : 'Unhealthy'}`)
      return isHealthy
    } catch (err) {
      this.log.error('Error performing Redis health check:', err)
      return false
    }
  }

  get isConnected () {
    const publisherConnected = REDIS_IS_CONNECTED_STATUSES.includes(this.publisherClient.status)
    const subscriberConnected = REDIS_IS_CONNECTED_STATUSES.includes(this.subscriberClient.status)
    this.log.debug('Redis connection status', {
      publisherConnected,
      subscriberConnected
    })
    return { publisherConnected, subscriberConnected }
  }

  addEventListeners (client) {
    client.on('connect', () => this.log.info('Redis client connected'))
    client.on('error', (err) => this.log.error('Redis client error:', err))
  }

  async publish (channel, message) {
    try {
      await this.publisherClient.publish(channel, JSON.stringify(message))
      this.log.info(`Message published to channel: ${channel}`)
    } catch (err) {
      this.log.error('Error publishing message:', err)
      rethrowRedisError(err)
    }
  }

  async subscribe (channel, callback) {
    try {
      await this.subscriberClient.subscribe(channel)
      this.subscriberClient.on('message', (subscribedChannel, message) => {
        if (subscribedChannel === channel) {
          callback(JSON.parse(message))
        }
      })
      this.log.info(`Subscribed to channel: ${channel}`)
      return channel
    } catch (err) {
      this.log.error('Error subscribing to channel:', err)
      rethrowRedisError(err)
    }
  }

  async unsubscribe (channel) {
    try {
      await this.subscriberClient.unsubscribe(channel)
      this.log.info(`Unsubscribed from channel: ${channel}`)
    } catch (err) {
      this.log.error('Error unsubscribing from channel:', err)
      rethrowRedisError(err)
    }
  }

  async broadcast (channels, message) {
    try {
      for (const channel of channels) {
        await this.publish(channel, message)
      }
      this.log.info(`Message broadcasted to channels: ${channels.join(', ')}`)
    } catch (err) {
      this.log.error('Error broadcasting message:', err)
      rethrowRedisError(err)
    }
  }
}

module.exports = PubSub
