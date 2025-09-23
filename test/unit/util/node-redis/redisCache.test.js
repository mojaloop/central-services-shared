const Test = require('tapes')(require('tape'))
const sinon = require('sinon')
const proxyquire = require('proxyquire')

Test('RedisCache (node-redis)', (t) => {
  let RedisCache, sandbox, mockRedisClient, mockLogger, retryCommandStub, rethrowRedisErrorStub

  const mockConfig = { host: 'localhost', port: 6379 }
  const mockClusterConfig = {
    cluster: [{ host: 'localhost', port: 7000 }, { host: 'localhost', port: 7001 }],
    password: 'secret'
  }

  function getMockRedisClient (overrides = {}) {
    return {
      connect: sinon.stub().resolves(),
      quit: sinon.stub().resolves(),
      ping: sinon.stub().resolves('PONG'),
      get: sinon.stub().resolves('value'),
      set: sinon.stub().resolves(),
      del: sinon.stub().resolves(),
      keys: sinon.stub().resolves(['a', 'b']),
      multi: sinon.stub().returns({
        del: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves()
      }),
      removeAllListeners: sinon.stub(),
      isOpen: true,
      on: sinon.stub(),
      ...overrides
    }
  }

  t.beforeEach((t) => {
    sandbox = sinon.createSandbox()
    mockLogger = {
      error: sandbox.stub(),
      warn: sandbox.stub(),
      info: sandbox.stub(),
      verbose: sandbox.stub(),
      debug: sandbox.stub()
    }
    retryCommandStub = sandbox.stub().callsFake(fn => fn())
    rethrowRedisErrorStub = sandbox.stub()
    mockRedisClient = getMockRedisClient()
    RedisCache = proxyquire('../../../../src/util/node-redis/redisCache', {
      redis: {
        createClient: sandbox.stub().returns(mockRedisClient),
        createCluster: sandbox.stub().returns(mockRedisClient)
      },
      '../createLogger': { createLogger: () => mockLogger },
      '../rethrow': { rethrowRedisError: rethrowRedisErrorStub },
      '../redis/shared': { retryCommand: retryCommandStub }
    })
    t.end()
  })

  t.afterEach((t) => {
    sandbox.restore()
    t.end()
  })

  t.test('should create a RedisCache instance (standalone)', async (t) => {
    const cache = new RedisCache(mockConfig)
    t.ok(cache)
    t.equal(cache.isCluster, false)
    t.ok(cache.redisClient)
    t.end()
  })

  t.test('should create a RedisCache instance (cluster)', async (t) => {
    const cache = new RedisCache(mockClusterConfig)
    t.ok(cache)
    t.equal(cache.isCluster, true)
    t.ok(cache.redisClient)
    t.end()
  })

  t.test('connect should call redisClient.connect if not connected', async (t) => {
    mockRedisClient.isOpen = false
    const cache = new RedisCache(mockConfig, mockRedisClient)
    await cache.connect()
    t.ok(mockRedisClient.connect.calledOnce)
    t.ok(mockLogger.verbose.calledWithMatch('proxyCache is connected'))
    t.end()
  })

  t.test('connect should not reconnect if already connected', async (t) => {
    mockRedisClient.isOpen = true
    const cache = new RedisCache(mockConfig, mockRedisClient)
    await cache.connect()
    t.ok(mockLogger.warn.calledWithMatch('proxyCache is already connected'))
    t.end()
  })

  t.test('disconnect should call redisClient.quit and removeAllListeners', async (t) => {
    const cache = new RedisCache(mockConfig, mockRedisClient)
    await cache.disconnect()
    t.ok(mockRedisClient.quit.calledOnce)
    t.ok(mockRedisClient.removeAllListeners.calledOnce)
    t.ok(mockLogger.info.calledWithMatch('proxyCache is disconnected'))
    t.end()
  })

  t.test('healthCheck should return true if ping returns PONG', async (t) => {
    const cache = new RedisCache(mockConfig, mockRedisClient)
    const healthy = await cache.healthCheck()
    t.equal(healthy, true)
    t.ok(mockLogger.debug.calledWithMatch('healthCheck ping response'))
    t.end()
  })

  t.test('healthCheck should return false if ping throws', async (t) => {
    retryCommandStub.callsFake(() => { throw new Error('fail') })
    const cache = new RedisCache(mockConfig, mockRedisClient)
    const healthy = await cache.healthCheck()
    t.equal(healthy, false)
    t.ok(mockLogger.warn.calledWithMatch('healthCheck error'))
    t.end()
  })

  t.test('isConnected getter should log and return isOpen', (t) => {
    const cache = new RedisCache(mockConfig, mockRedisClient)
    const isConnected = cache.isConnected
    t.ok(mockLogger.debug.calledWithMatch('isConnected'))
    t.equal(isConnected, mockRedisClient.isOpen)
    t.end()
  })

  t.test('ensureConnected should reconnect if not open', async (t) => {
    mockRedisClient.isOpen = false
    const cache = new RedisCache(mockConfig, mockRedisClient)
    await cache.ensureConnected(mockRedisClient)
    t.ok(mockLogger.warn.calledWithMatch('Redis client not connected'))
    t.ok(mockRedisClient.connect.calledOnce)
    t.end()
  })

  t.test('get should call redisClient.get and return value', async (t) => {
    const cache = new RedisCache(mockConfig, mockRedisClient)
    const val = await cache.get('foo')
    t.equal(val, 'value')
    t.ok(mockRedisClient.get.calledWith('foo'))
    t.end()
  })

  t.test('set should call redisClient.set with ttl', async (t) => {
    const cache = new RedisCache(mockConfig, mockRedisClient)
    await cache.set('foo', 'bar', 10)
    t.ok(mockRedisClient.set.calledWith('foo', 'bar', { EX: 10 }))
    t.end()
  })

  t.test('set should call redisClient.set without ttl', async (t) => {
    const cache = new RedisCache(mockConfig, mockRedisClient)
    await cache.set('foo', 'bar')
    t.ok(mockRedisClient.set.calledWith('foo', 'bar'))
    t.end()
  })

  t.test('delete should call redisClient.del', async (t) => {
    const cache = new RedisCache(mockConfig, mockRedisClient)
    await cache.delete('foo')
    t.ok(mockRedisClient.del.calledWith('foo'))
    t.end()
  })

  t.test('clearCache should delete all keys', async (t) => {
    const cache = new RedisCache(mockConfig, mockRedisClient)
    await cache.clearCache()
    t.ok(mockRedisClient.keys.calledWith('*'))
    t.ok(mockRedisClient.multi.calledOnce)
    t.ok(mockRedisClient.multi().del.calledTwice)
    t.ok(mockRedisClient.multi().exec.calledOnce)
    t.end()
  })

  t.test('clearCache should not call del if no keys', async (t) => {
    mockRedisClient.keys.resolves([])
    const cache = new RedisCache(mockConfig, mockRedisClient)
    await cache.clearCache()
    t.ok(mockRedisClient.multi().del.notCalled)
    t.end()
  })

  t.test('should rethrow error on get failure', async (t) => {
    retryCommandStub.callsFake(() => { throw new Error('fail') })
    const cache = new RedisCache(mockConfig, mockRedisClient)
    await cache.get('foo')
    t.ok(rethrowRedisErrorStub.called)
    t.end()
  })

  t.end()
})
