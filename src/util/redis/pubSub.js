'use strict'
const Redis = require('ioredis')
const { createLogger } = require('../index')
const isClusterConfig = (config) => { return 'cluster' in config }
const { rethrowRedisError } = require('../rethrow')

class PubSub {
  constructor (config, client) {
    this.config = config
    this.isCluster = isClusterConfig(config)
    this.log = createLogger(this.constructor.name)
    this.redisClient = client || this.createRedisClient()
    this.subscriberClient = this.createRedisClient()
    this.addEventListeners(this.redisClient)
    this.addEventListeners(this.subscriberClient)
  }

  createRedisClient () {
    this.config.lazyConnect ??= true
    return this.isCluster
      ? new Redis.Cluster(this.config.cluster, this.config)
      : new Redis(this.config)
  }

  addEventListeners (client) {
    client.on('connect', () => this.log.info('Redis client connected'))
    client.on('error', (err) => this.log.error('Redis client error:', err))
  }

  async publish (channel, message) {
    try {
      await this.redisClient.publish(channel, JSON.stringify(message))
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
