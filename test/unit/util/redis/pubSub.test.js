const Test = require('tapes')(require('tape'))
const sinon = require('sinon')
const Redis = require('ioredis')
const PubSub = require('../../../../src/util/redis/pubSub')
const { constructSystemExtensionError } = require('../../../../src/util/rethrow')

Test('PubSub', (t) => {
  let sandbox

  t.beforeEach((t) => {
    sandbox = sinon.createSandbox()
    sandbox.stub(Redis.prototype, 'publish')
    sandbox.stub(Redis.prototype, 'subscribe')
    sandbox.stub(Redis.prototype, 'unsubscribe')
    sandbox.stub(Redis.prototype, 'on')
    sandbox.stub(Redis.Cluster.prototype, 'on')
    t.end()
  })

  t.afterEach((t) => {
    sandbox.restore()
    t.end()
  })

  t.test('should create a Redis client and subscriber', (t) => {
    const config = { lazyConnect: true }
    const pubSub = new PubSub(config)
    t.ok(pubSub.redisClient instanceof Redis, 'redisClient is an instance of Redis')
    t.ok(pubSub.subscriberClient instanceof Redis, 'subscriberClient is an instance of Redis')
    t.end()
  })

  t.test('should publish a message to a channel', async (t) => {
    const config = {}
    const pubSub = new PubSub(config)
    const channel = 'test-channel'
    const message = { key: 'value' }
    await pubSub.publish(channel, message)

    t.ok(pubSub.redisClient.publish.calledWith(channel, JSON.stringify(message)), 'publish called with correct arguments')
    t.end()
  })

  t.test('should handle error when publishing a message', async (t) => {
    const config = {}
    const pubSub = new PubSub(config)
    const channel = 'test-channel'
    const message = { key: 'value' }
    const error = new Error('Publish error')

    pubSub.redisClient.publish.rejects(error)

    try {
      await pubSub.publish(channel, message)
      t.fail('Should have thrown an error')
    } catch (err) {
      t.deepEqual(err, constructSystemExtensionError(error, '["redis"]'), 'Error thrown and rethrown correctly')
    }
    t.end()
  })

  t.test('should subscribe to a channel and handle messages', async (t) => {
    const config = {}
    const pubSub = new PubSub(config)
    const channel = 'test-channel'
    const callback = sinon.stub()
    const message = JSON.stringify({ key: 'value' })

    await pubSub.subscribe(channel, callback)
    pubSub.subscriberClient.on.callArgWith(1, channel, message)

    t.ok(pubSub.subscriberClient.subscribe.calledWith(channel), 'subscribe called with correct channel')
    t.ok(callback.calledWith(JSON.parse(message)), 'callback called with parsed message')
    t.end()
  })

  t.test('should handle error when subscribing to a channel', async (t) => {
    const config = {}
    const pubSub = new PubSub(config)
    const channel = 'test-channel'
    const callback = sinon.stub()
    const error = new Error('Subscribe error')

    pubSub.subscriberClient.subscribe.rejects(error)

    try {
      await pubSub.subscribe(channel, callback)
      t.fail('Should have thrown an error')
    } catch (err) {
      t.deepEqual(err, constructSystemExtensionError(error, '["redis"]'), 'Error thrown and rethrown correctly')
    }
    t.end()
  })

  t.test('should unsubscribe from a channel', async (t) => {
    const config = {}
    const pubSub = new PubSub(config)
    const channel = 'test-channel'

    await pubSub.unsubscribe(channel)

    t.ok(pubSub.subscriberClient.unsubscribe.calledWith(channel), 'unsubscribe called with correct channel')
    t.end()
  })

  t.test('should handle error when unsubscribing from a channel', async (t) => {
    const config = {}
    const pubSub = new PubSub(config)
    const channel = 'test-channel'
    const error = new Error('Unsubscribe error')

    pubSub.subscriberClient.unsubscribe.rejects(error)

    try {
      await pubSub.unsubscribe(channel)
      t.fail('Should have thrown an error')
    } catch (err) {
      t.deepEqual(err, constructSystemExtensionError(error, '["redis"]'), 'Error thrown and rethrown correctly')
    }
    t.end()
  })

  t.test('should broadcast a message to multiple channels', async (t) => {
    const config = {}
    const pubSub = new PubSub(config)
    const channels = ['channel1', 'channel2']
    const message = { key: 'value' }

    await pubSub.broadcast(channels, message)

    t.ok(pubSub.redisClient.publish.calledTwice, 'publish called twice')
    t.ok(pubSub.redisClient.publish.firstCall.calledWith(channels[0], JSON.stringify(message)), 'publish called with first channel and message')
    t.ok(pubSub.redisClient.publish.secondCall.calledWith(channels[1], JSON.stringify(message)), 'publish called with second channel and message')
    t.end()
  })

  t.test('should handle error when broadcasting a message', async (t) => {
    const config = {}
    const pubSub = new PubSub(config)
    const channels = ['channel1', 'channel2']
    const message = { key: 'value' }
    const error = new Error('Broadcast error')

    pubSub.redisClient.publish.onFirstCall().rejects(error)

    try {
      await pubSub.broadcast(channels, message)
      t.fail('Should have thrown an error')
    } catch (err) {
      t.deepEqual(err, constructSystemExtensionError(error, '["redis"]'), 'Error thrown and rethrown correctly')
    }
    t.end()
  })

  t.end()
})
