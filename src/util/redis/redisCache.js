const Redis = require('ioredis')
const { createLogger } = require('../index')
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
