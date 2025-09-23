const Test = require('tapes')(require('tape'))
const sinon = require('sinon')
const Proxyquire = require('proxyquire')

Test('PubSub (node-redis)', (t) => {
  let sandbox
  let publisherClientStub
  let subscriberClientStub
  let retryCommandStub
  let PubSub

  t.beforeEach((t) => {
    sandbox = sinon.createSandbox()
    publisherClientStub = {
      publish: sandbox.stub().resolves(),
      ping: sandbox.stub().resolves('PONG'),
      connect: sandbox.stub().resolves(),
      quit: sandbox.stub().resolves('OK'),
      on: sandbox.stub().returnsThis(),
      isOpen: true
    }
    subscriberClientStub = {
      subscribe: sandbox.stub().resolves(),
      unsubscribe: sandbox.stub().resolves(),
      ping: sandbox.stub().resolves('PONG'),
      connect: sandbox.stub().resolves(),
      quit: sandbox.stub().resolves('OK'),
      on: sandbox.stub().returnsThis(),
      removeAllListeners: sandbox.stub(),
      isOpen: true
    }
    retryCommandStub = sandbox.stub().callsFake(async (fn) => fn())
    PubSub = Proxyquire('../../../../src/util/node-redis/pubSub', {
      '../redis/shared': { retryCommand: retryCommandStub },
      '../createLogger': { createLogger: () => ({ info: sandbox.stub(), error: sandbox.stub(), warn: sandbox.stub(), debug: sandbox.stub() }) },
      '../rethrow': { rethrowRedisError: (err) => { throw err } },
      '../../constants': { REDIS_SUCCESS: 'OK' }
    })
    t.end()
  })

  t.afterEach((t) => {
    sandbox.restore()
    t.end()
  })

  t.test('should create a Redis client and subscriber', (t) => {
    const config = { lazyConnect: true }
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    t.equal(pubSub.publisherClient, publisherClientStub, 'publisherClient is the stub')
    t.equal(pubSub.subscriberClient, subscriberClientStub, 'subscriberClient is the stub')
    t.end()
  })

  t.test('should publish a message to a channel', async (t) => {
    const config = {}
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    const channel = 'test-channel'
    const message = { key: 'value' }
    await pubSub.publish(channel, message)
    t.ok(pubSub.publisherClient.publish.calledWith(channel, JSON.stringify(message)), 'publish called with correct arguments')
    t.end()
  })

  t.test('should handle error when publishing a message', async (t) => {
    const config = {}
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    const channel = 'test-channel'
    const message = { key: 'value' }
    const error = new Error('Publish error')
    pubSub.publisherClient.publish.rejects(error)
    try {
      await pubSub.publish(channel, message)
      t.fail('Should throw')
    } catch (err) {
      t.equal(err, error, 'Error is thrown')
    }
    t.end()
  })

  t.test('should subscribe to a channel and handle messages', async (t) => {
    const config = {}
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    const channel = 'test-channel'
    const callback = sandbox.stub()
    // Simulate subscribe: listener is passed to subscribe
    let listener
    subscriberClientStub.subscribe.callsFake(async (chan, cb) => { listener = cb })
    await pubSub.subscribe(channel, callback)
    listener && listener(JSON.stringify({ foo: 'bar' }), channel)
    t.ok(callback.calledWith({ foo: 'bar' }), 'callback called with parsed message')
    t.end()
  })

  t.test('should not call callback if subscribedChannel does not match channel', async (t) => {
    const config = {}
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    const channel = 'test-channel'
    const callback = sandbox.stub()
    let listener
    subscriberClientStub.subscribe.callsFake(async (chan, cb) => { listener = cb })
    await pubSub.subscribe(channel, callback)
    listener && listener(JSON.stringify({ foo: 'bar' }), 'other-channel')
    t.notOk(callback.called, 'callback not called')
    t.end()
  })

  t.test('should handle error when subscribing to a channel', async (t) => {
    const config = {}
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    const channel = 'test-channel'
    const callback = sandbox.stub()
    const error = new Error('Subscribe error')
    subscriberClientStub.subscribe.rejects(error)
    try {
      await pubSub.subscribe(channel, callback)
      t.fail('Should throw')
    } catch (err) {
      t.equal(err, error, 'Error is thrown')
    }
    t.end()
  })

  t.test('should unsubscribe from a channel', async (t) => {
    const config = {}
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    const channel = 'test-channel'
    // Simulate subscribe to set listener
    let listener
    subscriberClientStub.subscribe.callsFake(async (chan, cb) => { listener = cb })
    await pubSub.subscribe(channel, () => {})
    await pubSub.unsubscribe(channel)
    t.ok(subscriberClientStub.unsubscribe.calledWith(channel, listener), 'unsubscribe called with correct channel and listener')
    t.end()
  })

  t.test('should handle error when unsubscribing from a channel', async (t) => {
    const config = {}
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    const channel = 'test-channel'
    subscriberClientStub.unsubscribe.rejects(new Error('Unsub error'))
    try {
      await pubSub.unsubscribe(channel)
      t.fail('Should throw')
    } catch (err) {
      t.equal(err.message, 'Unsub error')
    }
    t.end()
  })

  t.test('should broadcast a message to multiple channels', async (t) => {
    const config = {}
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    const channels = ['channel1', 'channel2']
    const message = { key: 'value' }
    await pubSub.broadcast(channels, message)
    t.ok(pubSub.publisherClient.publish.calledTwice, 'publish called twice')
    t.ok(pubSub.publisherClient.publish.firstCall.calledWith(channels[0], JSON.stringify(message)), 'publish called with first channel')
    t.ok(pubSub.publisherClient.publish.secondCall.calledWith(channels[1], JSON.stringify(message)), 'publish called with second channel')
    t.end()
  })

  t.test('should handle error when broadcasting a message', async (t) => {
    const config = {}
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    const channels = ['channel1', 'channel2']
    const message = { key: 'value' }
    pubSub.publisherClient.publish.onFirstCall().rejects(new Error('Broadcast error'))
    try {
      await pubSub.broadcast(channels, message)
      t.fail('Should throw')
    } catch (err) {
      t.equal(err.message, 'Broadcast error')
    }
    t.end()
  })

  t.test('should connect Redis clients successfully', async (t) => {
    const config = {}
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    await pubSub.connect()
    t.ok(pubSub.publisherClient.connect.calledOnce, 'publisherClient connect called')
    t.ok(pubSub.subscriberClient.connect.calledOnce, 'subscriberClient connect called')
    t.end()
  })

  t.test('should handle error when connecting Redis clients', async (t) => {
    const config = {}
    publisherClientStub.connect = sandbox.stub().rejects(new Error('Connect error'))
    subscriberClientStub.connect = sandbox.stub().resolves()
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    try {
      await pubSub.connect()
      t.fail('Should throw')
    } catch (err) {
      t.equal(err.message, 'Connect error')
    }
    t.end()
  })

  t.test('should disconnect Redis clients successfully', async (t) => {
    const config = {}
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    const result = await pubSub.disconnect()
    t.ok(publisherClientStub.quit.calledOnce, 'publisherClient quit called')
    t.ok(subscriberClientStub.quit.calledOnce, 'subscriberClient quit called')
    t.ok(subscriberClientStub.removeAllListeners.calledOnce, 'removeAllListeners called')
    t.equal(result, true, 'disconnect returns true')
    t.end()
  })

  t.test('should handle error when disconnecting Redis clients', async (t) => {
    const config = {}
    publisherClientStub.quit = sandbox.stub().rejects(new Error('Disconnect error'))
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    try {
      await pubSub.disconnect()
      t.fail('Should throw')
    } catch (err) {
      t.equal(err.message, 'Disconnect error')
    }
    t.end()
  })

  t.test('should perform health check and return true if both clients are healthy', async (t) => {
    const config = {}
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    const result = await pubSub.healthCheck()
    t.equal(result, true, 'healthCheck returns true')
    t.end()
  })

  t.test('should perform health check and return false if any client is unhealthy', async (t) => {
    const config = {}
    publisherClientStub.ping = sandbox.stub().resolves('PONG')
    subscriberClientStub.ping = sandbox.stub().resolves('NOT_PONG')
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    const result = await pubSub.healthCheck()
    t.equal(result, false, 'healthCheck returns false')
    t.end()
  })

  t.test('should handle error during health check and return false', async (t) => {
    const config = {}
    publisherClientStub.ping = sandbox.stub().rejects(new Error('Ping error'))
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    const result = await pubSub.healthCheck()
    t.equal(result, false, 'healthCheck returns false on error')
    t.end()
  })

  t.test('should return correct connection statuses for isConnected', (t) => {
    const config = {}
    publisherClientStub.isOpen = true
    subscriberClientStub.isOpen = false
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    const status = pubSub.isConnected
    t.equal(status.publisherConnected, true)
    t.equal(status.subscriberConnected, false)
    t.end()
  })

  t.test('should call connect on client if not connected in ensureConnected', async (t) => {
    const config = {}
    publisherClientStub.isOpen = false
    publisherClientStub.connect = sandbox.stub().resolves()
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    await pubSub.ensureConnected(publisherClientStub)
    t.ok(publisherClientStub.connect.calledOnce, 'connect called')
    t.end()
  })

  t.test('should not call connect on client if already connected in ensureConnected', async (t) => {
    const config = {}
    publisherClientStub.isOpen = true
    publisherClientStub.connect = sandbox.stub().resolves()
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    await pubSub.ensureConnected(publisherClientStub)
    t.notOk(publisherClientStub.connect.called, 'connect not called')
    t.end()
  })

  t.end()
})
