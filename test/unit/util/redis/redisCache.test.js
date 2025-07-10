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
  redisCacheTest.end()
})
