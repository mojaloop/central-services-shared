const Test = require('tapes')(require('tape'))
const sinon = require('sinon')
const RedisCache = require('../../../../src/util/redis/redisCache')
const { constructSystemExtensionError } = require('../../../../src/util/rethrow')

Test('RedisCache', redisCacheTest => {
  let sandbox, redisClientStub, redisCache

  redisCacheTest.beforeEach(t => {
    sandbox = sinon.createSandbox()
    redisClientStub = {
      connect: sandbox.stub().resolves(),
      quit: sandbox.stub().resolves(),
      ping: sandbox.stub().resolves('PONG'),
      get: sandbox.stub().resolves('value'),
      set: sandbox.stub().resolves(),
      del: sandbox.stub().resolves(),
      keys: sandbox.stub().resolves(['key']),
      pipeline: sandbox.stub().returns({
        del: sandbox.stub().returnsThis(),
        exec: sandbox.stub().resolves()
      }),
      on: sandbox.stub().returnsThis(),
      removeAllListeners: sandbox.stub()
    }
    // I can't figure out how to stub the ioredis cluster constructor with sinon
    redisCache = new RedisCache({
      cluster: [
        { host: 'localhost', port: 6379 }
      ]
    }, redisClientStub)
    t.end()
  })

  redisCacheTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  redisCacheTest.test('should create a Redis client', t => {
    t.ok(redisCache.redisClient, 'Redis client created')
    t.end()
  })

  redisCacheTest.test('should disconnect from Redis', async t => {
    await redisCache.disconnect()
    t.ok(redisClientStub.quit.called, 'quit called on Redis client')
    t.end()
  })

  redisCacheTest.test('should connect to Redis', async t => {
    await redisCache.connect()
    t.ok(redisClientStub.connect.called, 'connect called on Redis client')
    t.end()
  })

  redisCacheTest.test('should not connect to Redis if already connected', async t => {
    sandbox.stub(redisCache, 'isConnected').get(() => true)
    await redisCache.connect()
    t.ok(redisClientStub.connect.notCalled, 'connect not called on Redis client')
    t.end()
  })

  redisCacheTest.test('should perform a health check', async t => {
    await redisCache.healthCheck()
    t.ok(redisClientStub.ping.called, 'ping called on Redis client')
    t.end()
  })

  redisCacheTest.test('should return false when health check fails', async t => {
    const error = new Error('Redis ping error')
    redisClientStub.ping.rejects(error)
    const result = await redisCache.healthCheck()
    t.equal(result, false, 'Health check should return false')
    t.ok(redisClientStub.ping.called, 'ping called on Redis client')
    t.end()
  })

  redisCacheTest.test('should get a value from Redis', async t => {
    redisClientStub.get.resolves('value')
    const result = await redisCache.get('key')
    t.equal(result, 'value', 'Got value from Redis')
    t.end()
  })

  redisCacheTest.test('should set a value in Redis', async t => {
    await redisCache.set('key', 'value', 60)
    t.ok(redisClientStub.set.calledWith('key', 'value', 'EX', 60), 'Set value in Redis with TTL')
    t.end()
  })

  redisCacheTest.test('should set a value in Redis without TTL', async t => {
    await redisCache.set('key', 'value')
    t.ok(redisClientStub.set.calledWith('key', 'value'), 'Set value in Redis without TTL')
    t.end()
  })

  redisCacheTest.test('should delete a value from Redis', async t => {
    await redisCache.delete('key')
    t.ok(redisClientStub.del.calledWith('key'), 'Deleted value from Redis')
    t.end()
  })

  redisCacheTest.test('should clear the Redis cache', async t => {
    redisClientStub.keys.resolves(['key1', 'key2'])
    redisClientStub.pipeline.returns({
      del: sinon.stub().returnsThis(),
      exec: sinon.stub().resolves()
    })
    await redisCache.clearCache()
    t.ok(redisClientStub.pipeline().del.calledTwice, 'Cleared Redis cache')
    t.end()
  })

  redisCacheTest.test('should throw an error when getting a value from Redis fails', async t => {
    const error = new Error('Redis get error')
    redisClientStub.get.rejects(error)
    try {
      await redisCache.get('key')
      t.fail('Expected error to be thrown')
    } catch (err) {
      t.deepEqual(err, constructSystemExtensionError(error, '["redis"]'), 'Error thrown and rethrown correctly')
    }
    t.end()
  })

  redisCacheTest.test('should throw an error when setting a value in Redis fails', async t => {
    const error = new Error('Redis set error')
    redisClientStub.set.rejects(error)
    try {
      await redisCache.set('key', 'value', 60)
      t.fail('Expected error to be thrown')
    } catch (err) {
      t.deepEqual(err, constructSystemExtensionError(error, '["redis"]'), 'Error thrown and rethrown correctly')
    }
    t.end()
  })

  redisCacheTest.test('should throw an error when deleting a value from Redis fails', async t => {
    const error = new Error('Redis delete error')
    redisClientStub.del.rejects(error)
    try {
      await redisCache.delete('key')
      t.fail('Expected error to be thrown')
    } catch (err) {
      t.deepEqual(err, constructSystemExtensionError(error, '["redis"]'), 'Error thrown and rethrown correctly')
    }
    t.end()
  })

  redisCacheTest.test('should throw an error when clearing the Redis cache fails', async t => {
    const error = new Error('Redis clear cache error')
    redisClientStub.keys.rejects(error)
    try {
      await redisCache.clearCache()
      t.fail('Expected error to be thrown')
    } catch (err) {
      t.deepEqual(err, constructSystemExtensionError(error, '["redis"]'), 'Error thrown and rethrown correctly')
    }
    t.end()
  })
  redisCacheTest.end()
})
