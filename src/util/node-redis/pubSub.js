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

const isClusterConfig = (config) => { return 'cluster' in config }
const { createClient, createCluster } = require('redis')
const { createLogger } = require('../createLogger')
const { rethrowRedisError } = require('../rethrow')
const { REDIS_SUCCESS } = require('../../constants')
const { retryCommand } = require('../redis/shared')

class PubSub {
  /**
   * @param {object} config - Redis config
   * @param {object} [publisherClient]
   * @param {object} [subscriberClient]
   * @param {object} [options] - { retryAttempts, retryDelayMs }
   */
  constructor (config, publisherClient, subscriberClient, options = {}) {
    this.config = config
    this.isCluster = isClusterConfig(config)
    this.log = createLogger(this.constructor.name)
    this.retryAttempts = options.retryAttempts ?? undefined
    this.retryDelayMs = options.retryDelayMs ?? undefined
    this.publisherClient = publisherClient || this.createRedisClient()
    this.subscriberClient = subscriberClient || this.createRedisClient(true)
    this.addEventListeners(this.publisherClient)
    this.addEventListeners(this.subscriberClient)
    this._channelListeners = new Map()
  }

  createRedisClient (isSubscriber = false) {
    if (this.isCluster) {
      // node-redis expects rootNodes as [{ url: 'redis://host:port' }]
      const rootNodes = this.config.cluster.map(node => {
        const host = node.host || 'localhost'
        const port = node.port || 6379
        return { url: `redis://${host}:${port}` }
      })
      // Remove 'cluster' from config to avoid duplication
      const { cluster, ...restConfig } = this.config
      // Always use sharded pubsub mode for cluster subscribers
      if (isSubscriber) {
        return createCluster({
          rootNodes,
          ...restConfig,
          useReplicas: true,
          pubSubMode: 'sharded'
        })
      }
      return createCluster({
        rootNodes,
        ...restConfig
      })
    } else {
      return createClient(this.config)
    }
  }

  async connect () {
    try {
      await retryCommand(() => this.publisherClient.connect(), this.log, this.retryAttempts, this.retryDelayMs)
      await retryCommand(() => this.subscriberClient.connect(), this.log, this.retryAttempts, this.retryDelayMs)
      this.log.info('Redis clients connected successfully')
    } catch (err) {
      this.log.error('Error connecting Redis clients:', err)
      rethrowRedisError(err)
    }
  }

  async disconnect () {
    try {
      const publisherResponse = await retryCommand(() => this.publisherClient.quit(), this.log, this.retryAttempts, this.retryDelayMs)
      const subscriberResponse = await retryCommand(() => this.subscriberClient.quit(), this.log, this.retryAttempts, this.retryDelayMs)
      this.subscriberClient.removeAllListeners && this.subscriberClient.removeAllListeners()
      this._channelListeners.clear()
      this.log.info('Redis clients disconnected successfully')
      // node-redis quit returns 'OK'
      const isDisconnected = publisherResponse === REDIS_SUCCESS && subscriberResponse === REDIS_SUCCESS
      return isDisconnected
    } catch (err) {
      this.log.error('Error disconnecting Redis clients:', err)
      rethrowRedisError(err)
    }
  }

  async healthCheck () {
    try {
      const publisherStatus = await retryCommand(() => this.publisherClient.ping(), this.log, this.retryAttempts, this.retryDelayMs)
      const subscriberStatus = await retryCommand(() => this.subscriberClient.ping(), this.log, this.retryAttempts, this.retryDelayMs)
      const isHealthy = publisherStatus === 'PONG' && subscriberStatus === 'PONG'
      this.log.debug(`Redis health check: ${isHealthy ? 'Healthy' : 'Unhealthy'}`)
      return isHealthy
    } catch (err) {
      this.log.error('Error performing Redis health check:', err)
      return false
    }
  }

  get isConnected () {
    // node-redis v4: client.isOpen is true if connected
    const publisherConnected = this.publisherClient.isOpen === true
    const subscriberConnected = this.subscriberClient.isOpen === true
    this.log.debug('Redis connection status', {
      publisherConnected,
      subscriberConnected
    })
    return { publisherConnected, subscriberConnected }
  }

  addEventListeners (client) {
    client.on('connect', () => this.log.info('Redis client connected'))
    client.on('error', (err) => this.log.error('Redis client error:', err))
    client.on('end', () => this.log.warn('Redis client connection closed'))
    client.on('reconnecting', () => this.log.warn('Redis client reconnecting'))
  }

  async publish (channel, message) {
    try {
      await this.ensureConnected(this.publisherClient)
      await retryCommand(() => this.publisherClient.publish(channel, JSON.stringify(message)), this.log, this.retryAttempts, this.retryDelayMs)
      this.log.info(`Message published to channel: ${channel}`)
    } catch (err) {
      this.log.error('Error publishing message:', err)
      rethrowRedisError(err)
    }
  }

  async subscribe (channel, callback) {
    try {
      await this.ensureConnected(this.subscriberClient)
      // node-redis v4: subscriberClient.subscribe returns a Promise
      const listener = (message, subscribedChannel) => {
        // node-redis v4: subscribe callback receives (message, channel)
        if (subscribedChannel === channel) {
          callback(JSON.parse(message))
        }
      }
      await retryCommand(() => this.subscriberClient.subscribe(channel, listener), this.log, this.retryAttempts, this.retryDelayMs)
      this._channelListeners.set(channel, { listener })
      this.log.info(`Subscribed to channel: ${channel}`)
      return channel
    } catch (err) {
      this.log.error('Error subscribing to channel:', err)
      rethrowRedisError(err)
    }
  }

  async unsubscribe (channel) {
    try {
      await this.ensureConnected(this.subscriberClient)
      // Remove the event listener for this channel if it exists
      const listenerObj = this._channelListeners.get(channel)
      if (listenerObj) {
        // node-redis v4: unsubscribe removes the callback for the channel
        await retryCommand(() => this.subscriberClient.unsubscribe(channel, listenerObj.listener), this.log, this.retryAttempts, this.retryDelayMs)
        this._channelListeners.delete(channel)
      } else {
        await retryCommand(() => this.subscriberClient.unsubscribe(channel), this.log, this.retryAttempts, this.retryDelayMs)
      }
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

  async ensureConnected (client) {
    // node-redis v4: client.isOpen
    if (!client.isOpen) {
      this.log.warn('Redis client not connected, attempting to reconnect...')
      await retryCommand(() => client.connect(), this.log, this.retryAttempts, this.retryDelayMs)
    }
  }
}

module.exports = PubSub
