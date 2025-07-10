const Test = require('tapes')(require('tape'))
const sinon = require('sinon')
let RedisCache = require('../../../../src/util/redis/redisCache')
const { constructSystemExtensionError } = require('../../../../src/util/rethrow')
const Proxyquire = require('proxyquire')

Test('RedisCache', redisCacheTest => {
  let sandbox, redisClientStub, redisCache, retryCommandStub

  redisCacheTest.beforeEach(t => {
    sandbox = sinon.createSandbox()
    redisClientStub = {
      connect: sandbox.stub().resolves(),
      quit: sandbox.stub().resolves('OK'),
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
      removeAllListeners: sandbox.stub(),
      status: 'ready'
    }
    // Stub retryCommand to just call the function directly for most tests
    // Use Proxyquire to inject a stubbed retryCommand into RedisCache
    retryCommandStub = sandbox.stub().callsFake(async (fn) => fn())
    const RedisCacheWithStub = Proxyquire('../../../../src/util/redis/redisCache', {
      './shared': { retryCommand: retryCommandStub }
    })
    RedisCache = RedisCacheWithStub

    redisCache = new RedisCache({
      cluster: [
        { host: 'localhost', port: 6379 }
      ]
    }, redisClientStub)
    // Stub ensureConnected to avoid actual connection logic
    sandbox.stub(redisCache, 'ensureConnected').resolves()
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
    t.ok(retryCommandStub.called, 'retryCommand called for quit')
    t.ok(redisClientStub.quit.called, 'quit called on Redis client')
    t.ok(redisClientStub.removeAllListeners.called, 'removeAllListeners called')
    t.end()
  })

  redisCacheTest.test('should connect to Redis', async t => {
    // Unstub ensureConnected for connect test
    redisCache.ensureConnected.restore && redisCache.ensureConnected.restore()
    redisClientStub.status = 'end'
    await redisCache.connect()
    t.ok(retryCommandStub.called, 'retryCommand called for connect')
    t.ok(redisClientStub.connect.called, 'connect called on Redis client')
    t.end()
  })

  redisCacheTest.test('should not connect to Redis if already connected', async t => {
    sandbox.stub(redisCache, 'isConnected').get(() => true)
    await redisCache.connect()
    t.ok(retryCommandStub.notCalled, 'retryCommand not called when already connected')
    t.ok(redisClientStub.connect.notCalled, 'connect not called on Redis client')
    t.end()
  })

  redisCacheTest.test('should perform a health check', async t => {
    await redisCache.healthCheck()
    t.ok(retryCommandStub.called, 'retryCommand called for ping')
    t.ok(redisClientStub.ping.called, 'ping called on Redis client')
    t.end()
  })

  redisCacheTest.test('should return false when health check fails', async t => {
    retryCommandStub.callsFake(async () => { throw new Error('Redis ping error') })
    const result = await redisCache.healthCheck()
    t.equal(result, false, 'Health check should return false')
    t.ok(retryCommandStub.called, 'retryCommand called for ping')
    t.end()
  })

  redisCacheTest.test('should get a value from Redis', async t => {
    redisClientStub.get.resolves('value')
    const result = await redisCache.get('key')
    t.ok(redisCache.ensureConnected.called, 'ensureConnected called before get')
    t.ok(retryCommandStub.called, 'retryCommand called for get')
    t.equal(result, 'value', 'Got value from Redis')
    t.end()
  })

  redisCacheTest.test('should set a value in Redis', async t => {
    await redisCache.set('key', 'value', 60)
    t.ok(redisCache.ensureConnected.called, 'ensureConnected called before set')
    t.ok(retryCommandStub.called, 'retryCommand called for set')
    t.ok(redisClientStub.set.calledWith('key', 'value', 'EX', 60), 'Set value in Redis with TTL')
    t.end()
  })

  redisCacheTest.test('should set a value in Redis without TTL', async t => {
    await redisCache.set('key', 'value')
    t.ok(redisCache.ensureConnected.called, 'ensureConnected called before set')
    t.ok(retryCommandStub.called, 'retryCommand called for set')
    t.ok(redisClientStub.set.calledWith('key', 'value'), 'Set value in Redis without TTL')
    t.end()
  })

  redisCacheTest.test('should delete a value from Redis', async t => {
    await redisCache.delete('key')
    t.ok(redisCache.ensureConnected.called, 'ensureConnected called before delete')
    t.ok(retryCommandStub.called, 'retryCommand called for del')
    t.ok(redisClientStub.del.calledWith('key'), 'Deleted value from Redis')
    t.end()
  })

  redisCacheTest.test('should clear the Redis cache', async t => {
    redisClientStub.keys.resolves(['key1', 'key2'])
    const pipelineDelStub = sinon.stub().returnsThis()
    const pipelineExecStub = sinon.stub().resolves()
    redisClientStub.pipeline.returns({
      del: pipelineDelStub,
      exec: pipelineExecStub
    })
    await redisCache.clearCache()
    t.ok(redisCache.ensureConnected.called, 'ensureConnected called before clearCache')
    t.ok(retryCommandStub.called, 'retryCommand called for keys')
    t.equal(pipelineDelStub.callCount, 2, 'del called for each key')
    t.ok(pipelineExecStub.called, 'exec called on pipeline')
    t.end()
  })

  redisCacheTest.test('should throw an error when getting a value from Redis fails', async t => {
    const error = new Error('Redis get error')
    retryCommandStub.callsFake(async () => { throw error })
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
    retryCommandStub.callsFake(async () => { throw error })
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
    retryCommandStub.callsFake(async () => { throw error })
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
    retryCommandStub.onFirstCall().callsFake(async () => { throw error })
    try {
      await redisCache.clearCache()
      t.fail('Expected error to be thrown')
    } catch (err) {
      t.deepEqual(err, constructSystemExtensionError(error, '["redis"]'), 'Error thrown and rethrown correctly')
    }
    t.end()
  })

  redisCacheTest.test('should set lazyConnect to true if not set in config', t => {
    const config = { cluster: [{ host: 'localhost', port: 6379 }] }
    delete config.lazyConnect
    const RedisCacheWithStub = Proxyquire('../../../../src/util/redis/redisCache', {
      './shared': { retryCommand: retryCommandStub }
    })
    const redisCacheLocal = new RedisCacheWithStub(config)
    t.equal(redisCacheLocal.config.lazyConnect, true, 'lazyConnect set to true')
    t.end()
  })

  redisCacheTest.test('should use Redis.Cluster when cluster config is present', t => {
    const RedisStub = {
      Cluster: sinon.stub().returns(redisClientStub)
    }
    const config = { cluster: [{ host: 'localhost', port: 6379 }] }
    const RedisCacheWithStub = Proxyquire('../../../../src/util/redis/redisCache', {
      ioredis: RedisStub,
      './shared': { retryCommand: retryCommandStub }
    })
    const redisCache = new RedisCacheWithStub(config)
    t.ok(redisCache)
    t.ok(RedisStub.Cluster.called, 'Redis.Cluster constructor called')
    t.end()
  })

  redisCacheTest.test('should use Redis when cluster config is not present', t => {
    const RedisStub = sinon.stub().returns(redisClientStub)
    const config = { host: 'localhost', port: 6379 }
    const RedisCacheWithStub = Proxyquire('../../../../src/util/redis/redisCache', {
      ioredis: RedisStub,
      './shared': { retryCommand: retryCommandStub }
    })
    const redisCache = new RedisCacheWithStub(config)
    t.ok(redisCache, 'RedisCache instance created')
    t.ok(RedisStub.called, 'Redis constructor called')
    t.end()
  })

  redisCacheTest.test('should add event listeners to redis client', t => {
    const log = {
      error: sinon.stub(),
      info: sinon.stub(),
      warn: sinon.stub(),
      verbose: sinon.stub()
    }
    const redisClient = {
      on: sinon.stub().returnsThis()
    }
    const RedisCacheWithStub = Proxyquire('../../../../src/util/redis/redisCache', {
      './shared': { retryCommand: retryCommandStub },
      '../createLogger': { createLogger: () => log }
    })
    const redisCache = new RedisCacheWithStub({ cluster: [{}] }, redisClient)
    t.ok(redisCache, 'RedisCache instance created')
    t.equal(redisClient.on.callCount, 6, 'All listeners attached')
    t.end()
  })

  redisCacheTest.test('should return false for isConnected if status is not connected', t => {
    redisClientStub.status = 'end'
    const result = redisCache.isConnected
    t.equal(result, false, 'isConnected returns false')
    t.end()
  })

  redisCacheTest.test('addEventListeners attaches all expected event handlers', t => {
    const log = {
      error: sinon.stub(),
      info: sinon.stub(),
      warn: sinon.stub(),
      verbose: sinon.stub()
    }
    const redisClient = {
      on: sinon.stub().returnsThis()
    }
    const RedisCacheWithStub = Proxyquire('../../../../src/util/redis/redisCache', {
      './shared': { retryCommand: retryCommandStub },
      '../createLogger': { createLogger: () => log }
    })
    const redisCache = new RedisCacheWithStub({ cluster: [{}] }, redisClient)
    t.ok(redisCache, 'RedisCache instance created')
    // Should attach 6 listeners: error, close, end, reconnecting, connect, ready
    t.equal(redisClient.on.callCount, 6, 'All expected event listeners attached')
    t.ok(redisClient.on.calledWith('error'), 'error event attached')
    t.ok(redisClient.on.calledWith('close'), 'close event attached')
    t.ok(redisClient.on.calledWith('end'), 'end event attached')
    t.ok(redisClient.on.calledWith('reconnecting'), 'reconnecting event attached')
    t.ok(redisClient.on.calledWith('connect'), 'connect event attached')
    t.ok(redisClient.on.calledWith('ready'), 'ready event attached')
    t.end()
  })

  redisCacheTest.test('event listeners trigger correct logger methods', t => {
    const log = {
      error: sinon.stub(),
      info: sinon.stub(),
      warn: sinon.stub(),
      verbose: sinon.stub(),
      debug: sinon.stub()
    }
    // We'll store the handlers for each event
    const eventHandlers = {}
    const redisClient = {
      on: function (event, handler) {
        eventHandlers[event] = handler
        return this
      }
    }
    const RedisCacheWithStub = Proxyquire('../../../../src/util/redis/redisCache', {
      './shared': { retryCommand: retryCommandStub },
      '../createLogger': { createLogger: () => log }
    })
    // Instantiating will attach listeners
    const redisCache = new RedisCacheWithStub({ cluster: [{}] }, redisClient)
    t.ok(redisCache, 'RedisCache instance created')
    // Simulate events
    eventHandlers.error && eventHandlers.error('err')
    t.ok(log.error.calledWith('redis connection error', 'err'), 'error logger called on error event')

    eventHandlers.close && eventHandlers.close()
    t.ok(log.info.calledWith('redis connection closed'), 'info logger called on close event')

    eventHandlers.end && eventHandlers.end()
    t.ok(log.warn.calledWith('redis connection ended'), 'warn logger called on end event')

    eventHandlers.reconnecting && eventHandlers.reconnecting(1234)
    t.ok(log.info.calledWith('redis connection reconnecting', { ms: 1234 }), 'info logger called on reconnecting event')

    eventHandlers.connect && eventHandlers.connect()
    t.ok(log.verbose.calledWith('redis connection is established'), 'verbose logger called on connect event')

    eventHandlers.ready && eventHandlers.ready()
    t.ok(log.verbose.calledWith('redis connection is ready'), 'verbose logger called on ready event')

    t.end()
  })

  redisCacheTest.test('should throw an error when connect fails', async t => {
    const error = new Error('Redis connect error')
    retryCommandStub.callsFake(async () => { throw error })
    // Unstub ensureConnected for connect test
    redisCache.ensureConnected.restore && redisCache.ensureConnected.restore()
    redisClientStub.status = 'end'
    try {
      await redisCache.connect()
      t.fail('Expected error to be thrown')
    } catch (err) {
      t.deepEqual(err, constructSystemExtensionError(error, '["redis"]'), 'Error thrown and rethrown correctly on connect')
    }
    t.end()
  })

  redisCacheTest.test('should throw an error when disconnect fails', async t => {
    const error = new Error('Redis disconnect error')
    retryCommandStub.callsFake(async () => { throw error })
    try {
      await redisCache.disconnect()
      t.fail('Expected error to be thrown')
    } catch (err) {
      t.deepEqual(err, constructSystemExtensionError(error, '["redis"]'), 'Error thrown and rethrown correctly on disconnect')
    }
    t.end()
  })

  redisCacheTest.test('ensureConnected does not reconnect if already connected', async t => {
    // status is 'ready', which is in REDIS_IS_CONNECTED_STATUSES
    redisClientStub.status = 'ready'
    await redisCache.ensureConnected(redisClientStub)
    t.ok(redisClientStub.connect.notCalled, 'connect not called when already connected')
    t.end()
  })

  redisCacheTest.test('ensureConnected reconnects if not connected', async t => {
    // Restore the original ensureConnected method to test actual logic
    if (redisCache.ensureConnected.restore) redisCache.ensureConnected.restore()
    // Reset retryCommandStub to default behavior for this test
    retryCommandStub.resetBehavior()
    retryCommandStub.callsFake(async (fn) => fn())
    redisClientStub.connect.resetHistory && redisClientStub.connect.resetHistory()
    redisClientStub.status = 'end' // not in REDIS_IS_CONNECTED_STATUSES
    await redisCache.ensureConnected(redisClientStub)
    t.ok(retryCommandStub.called, 'retryCommand called for connect')
    t.ok(redisClientStub.connect.called, 'connect called on Redis client')
    t.end()
  })

  redisCacheTest.test('ensureConnected throws error if reconnect fails', async t => {
    if (redisCache.ensureConnected.restore) redisCache.ensureConnected.restore()
    // Reset retryCommandStub to ensure correct behavior for this test
    retryCommandStub.resetBehavior()
    redisClientStub.connect.resetHistory && redisClientStub.connect.resetHistory()
    redisClientStub.status = 'end'
    const error = new Error('Reconnect failed')
    retryCommandStub.callsFake(async () => { throw error })
    try {
      await redisCache.ensureConnected(redisClientStub)
      t.fail('Expected error to be thrown')
    } catch (err) {
      t.equal(err, error, 'Error thrown when reconnect fails')
    }
    t.end()
  })
  redisCacheTest.end()
})
