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
const Test = require('tapes')(require('tape'))
const sinon = require('sinon')
const { constructSystemExtensionError } = require('../../../../src/util/rethrow')
const Proxyquire = require('proxyquire')

let PubSub = require('../../../../src/util/redis/pubSub')

Test('PubSub', (t) => {
  let sandbox
  let publisherClientStub
  let subscriberClientStub
  let retryCommandStub

  t.beforeEach((t) => {
    sandbox = sinon.createSandbox()
    publisherClientStub = {
      publish: sandbox.stub().resolves(),
      spublish: sandbox.stub().resolves(),
      ping: sandbox.stub().resolves('PONG'),
      connect: sandbox.stub().resolves(),
      quit: sandbox.stub().resolves(),
      on: sandbox.stub().returnsThis(),
      status: 'ready'
    }
    subscriberClientStub = {
      subscribe: sandbox.stub().resolves(),
      unsubscribe: sandbox.stub().resolves(),
      ssubscribe: sandbox.stub().resolves(),
      sunsubscribe: sandbox.stub().resolves(),
      on: sandbox.stub().returnsThis(),
      ping: sandbox.stub().resolves('PONG'),
      connect: sandbox.stub().resolves(),
      quit: sandbox.stub().resolves(),
      removeAllListeners: sandbox.stub().resolves(),
      removeListener: sandbox.stub(),
      status: 'ready'
    }

    retryCommandStub = sandbox.stub().callsFake(async (fn) => fn())
    const PubSubWithStub = Proxyquire('../../../../src/util/redis/pubSub', {
      './shared': { retryCommand: retryCommandStub }
    })
    PubSub = PubSubWithStub
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
      t.fail('Should have thrown an error')
    } catch (err) {
      t.deepEqual(err, constructSystemExtensionError(error, '["redis"]'), 'Error thrown and rethrown correctly')
    }
    t.end()
  })

  t.test('should subscribe to a channel and handle messages', async (t) => {
    const config = {}
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
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
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
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
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    const channel = 'test-channel'

    await pubSub.unsubscribe(channel)

    t.ok(pubSub.subscriberClient.unsubscribe.calledWith(channel), 'unsubscribe called with correct channel')
    t.end()
  })

  t.test('should handle error when unsubscribing from a channel', async (t) => {
    const config = {}
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
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
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    const channels = ['channel1', 'channel2']
    const message = { key: 'value' }

    await pubSub.broadcast(channels, message)

    t.ok(pubSub.publisherClient.publish.calledTwice, 'publish called twice')
    t.ok(pubSub.publisherClient.publish.firstCall.calledWith(channels[0], JSON.stringify(message)), 'publish called with first channel and message')
    t.ok(pubSub.publisherClient.publish.secondCall.calledWith(channels[1], JSON.stringify(message)), 'publish called with second channel and message')
    t.end()
  })

  t.test('should handle error when broadcasting a message', async (t) => {
    const config = {}
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    const channels = ['channel1', 'channel2']
    const message = { key: 'value' }
    const error = new Error('Broadcast error')

    pubSub.publisherClient.publish.onFirstCall().rejects(error)

    try {
      await pubSub.broadcast(channels, message)
      t.fail('Should have thrown an error')
    } catch (err) {
      t.deepEqual(err, constructSystemExtensionError(error, '["redis"]'), 'Error thrown and rethrown correctly')
    }
    t.end()
  })

  t.test('should connect Redis clients successfully', async (t) => {
    const config = {}
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)

    await pubSub.connect()

    t.ok(pubSub.publisherClient.connect.calledOnce, 'publisherClient connect called once')
    t.ok(pubSub.subscriberClient.connect.calledOnce, 'subscriberClient connect called once')
    t.end()
  })

  t.test('should handle error when connecting Redis clients', async (t) => {
    const config = {}
    const error = new Error('Connect error')
    // Overwrite connect stub before creating pubSub
    publisherClientStub.connect = sandbox.stub().rejects(error)
    subscriberClientStub.connect = sandbox.stub().resolves()
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)

    try {
      await pubSub.connect()
      t.fail('Should have thrown an error')
    } catch (err) {
      t.deepEqual(err, constructSystemExtensionError(error, '["redis"]'), 'Error thrown and rethrown correctly')
    }
    t.end()
  })

  t.test('should create a Redis Cluster client when cluster config is provided', (t) => {
    const config = { cluster: [{ host: '127.0.0.1', port: 6379 }] }
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)

    t.equal(pubSub.publisherClient, publisherClientStub, 'publisherClient is the stub')
    t.equal(pubSub.subscriberClient, subscriberClientStub, 'subscriberClient is the stub')
    t.end()
  })

  t.test('should connect Redis Cluster clients successfully', async (t) => {
    const config = { cluster: [{ host: '127.0.0.1', port: 6379 }] }
    // Overwrite connect before creating pubSub and pass into constructor
    publisherClientStub.connect = sandbox.stub().resolves()
    subscriberClientStub.connect = sandbox.stub().resolves()
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)

    await pubSub.connect()

    t.ok(pubSub.publisherClient.connect.calledOnce, 'publisherClient connect called once')
    t.ok(pubSub.subscriberClient.connect.calledOnce, 'subscriberClient connect called once')
    t.end()
  })

  t.test('should handle error when connecting Redis Cluster clients', async (t) => {
    const config = { cluster: [{ host: '127.0.0.1', port: 6379 }] }
    const error = new Error('Cluster connect error')
    // Overwrite connect before creating pubSub and pass into constructor
    publisherClientStub.connect = sandbox.stub().rejects(error)
    subscriberClientStub.connect = sandbox.stub().resolves()
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)

    try {
      await pubSub.connect()
      t.fail('Should have thrown an error')
    } catch (err) {
      t.deepEqual(err, constructSystemExtensionError(error, '["redis"]'), 'Error thrown and rethrown correctly')
    }
    t.end()
  })

  t.test('should not call callback if subscribedChannel does not match channel', async (t) => {
    const config = {}
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    const channel = 'test-channel'
    const callback = sinon.stub()
    const message = JSON.stringify({ key: 'value' })
    const otherChannel = 'other-channel'

    await pubSub.subscribe(channel, callback)
    pubSub.subscriberClient.on.callArgWith(1, otherChannel, message)

    t.ok(pubSub.subscriberClient.subscribe.calledWith(channel), 'subscribe called with correct channel')
    t.notOk(callback.called, 'callback not called when subscribedChannel does not match channel')
    t.end()
  })

  t.test('should disconnect Redis clients successfully', async (t) => {
    const config = {}
    // Overwrite stubs before creating pubSub and pass into constructor
    const publisherClient = {
      ...publisherClientStub,
      quit: sandbox.stub().resolves()
    }
    const subscriberClient = {
      ...subscriberClientStub,
      quit: sandbox.stub().resolves(),
      removeAllListeners: sandbox.stub().resolves()
    }
    const pubSub = new PubSub(config, publisherClient, subscriberClient)

    await pubSub.disconnect()

    t.ok(pubSub.publisherClient.quit.calledOnce, 'publisherClient quit called once')
    t.ok(pubSub.subscriberClient.quit.calledOnce, 'subscriberClient quit called once')
    t.ok(pubSub.subscriberClient.removeAllListeners.calledOnce, 'subscriberClient removeAllListeners called once')
    t.end()
  })

  t.test('should handle error when disconnecting Redis clients', async (t) => {
    const config = {}
    const error = new Error('Disconnect error')
    const publisherClient = {
      ...publisherClientStub,
      quit: sandbox.stub().rejects(error)
    }
    const subscriberClient = {
      ...subscriberClientStub,
      quit: sandbox.stub().resolves(),
      removeAllListeners: sandbox.stub().resolves()
    }
    const pubSub = new PubSub(config, publisherClient, subscriberClient)

    try {
      await pubSub.disconnect()
      t.fail('Should have thrown an error')
    } catch (err) {
      t.deepEqual(err, constructSystemExtensionError(error, '["redis"]'), 'Error thrown and rethrown correctly')
    }
    t.end()
  })

  t.test('should perform health check and return true if both clients are healthy', async (t) => {
    const config = {}
    // Overwrite stubs before creating pubSub and pass into constructor
    const publisherClient = {
      ...publisherClientStub,
      ping: sandbox.stub().resolves('PONG')
    }
    const subscriberClient = {
      ...subscriberClientStub,
      ping: sandbox.stub().resolves('PONG')
    }
    const pubSub = new PubSub(config, publisherClient, subscriberClient)

    const isHealthy = await pubSub.healthCheck()

    t.equal(isHealthy, true, 'healthCheck returns true when both clients are healthy')
    t.ok(pubSub.publisherClient.ping.calledOnce, 'publisherClient ping called once')
    t.ok(pubSub.subscriberClient.ping.calledOnce, 'subscriberClient ping called once')
    t.end()
  })

  t.test('should perform health check and return false if any client is unhealthy', async (t) => {
    const config = {}
    // Overwrite stubs before creating pubSub and pass into constructor
    const publisherClient = {
      ...publisherClientStub,
      ping: sandbox.stub().resolves('PONG')
    }
    const subscriberClient = {
      ...subscriberClientStub,
      ping: sandbox.stub().resolves('ERROR')
    }
    const pubSub = new PubSub(config, publisherClient, subscriberClient)

    const isHealthy = await pubSub.healthCheck()

    t.equal(isHealthy, false, 'healthCheck returns false when any client is unhealthy')
    t.ok(pubSub.publisherClient.ping.calledOnce, 'publisherClient ping called once')
    t.ok(pubSub.subscriberClient.ping.calledOnce, 'subscriberClient ping called once')
    t.end()
  })

  t.test('should handle error during health check and return false', async (t) => {
    const config = {}
    const error = new Error('Health check error')
    const publisherClient = {
      ...publisherClientStub,
      ping: sandbox.stub().rejects(error)
    }
    const subscriberClient = {
      ...subscriberClientStub,
      ping: sandbox.stub().resolves('PONG')
    }
    const pubSub = new PubSub(config, publisherClient, subscriberClient)

    const isHealthy = await pubSub.healthCheck()

    t.equal(isHealthy, false, 'healthCheck returns false when an error occurs')
    t.ok(pubSub.publisherClient.ping.calledOnce, 'publisherClient ping called once')
    t.notOk(pubSub.subscriberClient.ping.calledOnce, 'subscriberClient ping not called once')
    t.end()
  })

  t.test('should return correct connection statuses for isConnected', (t) => {
    const config = {}
    // Overwrite stubs before creating pubSub and pass into constructor
    const publisherClient = {
      ...publisherClientStub,
      status: 'ready'
    }
    const subscriberClient = {
      ...subscriberClientStub,
      status: 'ready'
    }
    const pubSub = new PubSub(config, publisherClient, subscriberClient)

    const connectionStatus = pubSub.isConnected

    t.deepEqual(connectionStatus, { publisherConnected: true, subscriberConnected: true }, 'isConnected returns correct statuses')
    t.end()
  })

  t.test('should return false connection statuses for isConnected when clients are not connected', (t) => {
    const config = {}
    // Overwrite stubs before creating pubSub and pass into constructor
    const publisherClient = {
      ...publisherClientStub,
      status: 'disconnected'
    }
    const subscriberClient = {
      ...subscriberClientStub,
      status: 'disconnected'
    }
    const pubSub = new PubSub(config, publisherClient, subscriberClient)

    const connectionStatus = pubSub.isConnected

    t.deepEqual(connectionStatus, { publisherConnected: false, subscriberConnected: false }, 'isConnected returns false statuses when clients are not connected')
    t.end()
  })
  t.test('should publish a message to a channel using spublish when isCluster is true', async (t) => {
    const config = { cluster: [{ host: '127.0.0.1', port: 6379 }] }
    const publisherClient = {
      ...publisherClientStub,
      spublish: sandbox.stub().resolves()
    }
    const pubSub = new PubSub(config, publisherClient, subscriberClientStub)
    const channel = 'cluster-channel'
    const message = { key: 'cluster-value' }

    await pubSub.publish(channel, message)

    t.ok(pubSub.publisherClient.spublish.calledWith(channel, JSON.stringify(message)), 'spublish called with correct arguments')
    t.end()
  })

  t.test('should handle error when publishing a message with spublish in cluster mode', async (t) => {
    const config = { cluster: [{ host: '127.0.0.1', port: 6379 }] }
    const error = new Error('Cluster spublish error')
    // Overwrite stubs before creating pubSub and pass into constructor
    const publisherClient = {
      ...publisherClientStub,
      spublish: sandbox.stub().rejects(error)
    }
    const pubSub = new PubSub(config, publisherClient, subscriberClientStub)
    const channel = 'cluster-channel'
    const message = { key: 'cluster-value' }

    try {
      await pubSub.publish(channel, message)
      t.fail('Should have thrown an error')
    } catch (err) {
      t.deepEqual(err, constructSystemExtensionError(error, '["redis"]'), 'Error thrown and rethrown correctly')
    }
    t.end()
  })

  t.test('should subscribe to a channel and handle smessage in cluster mode', async (t) => {
    const config = { cluster: [{ host: '127.0.0.1', port: 6379 }] }
    const channel = 'cluster-channel'
    const callback = sinon.stub()
    const message = JSON.stringify({ key: 'cluster-value' })
    const ssubscribeStub = sandbox.stub().resolves()
    const onStub = sandbox.stub().withArgs('smessage').yields(channel, message)
    const pubSub = new PubSub(
      config,
      publisherClientStub,
      {
        ...subscriberClientStub,
        ssubscribe: ssubscribeStub,
        on: onStub
      }
    )

    await pubSub.subscribe(channel, callback)

    t.ok(pubSub.subscriberClient.ssubscribe.calledWith(channel), 'ssubscribe called with correct channel')
    t.ok(callback.calledWith(JSON.parse(message)), 'callback called with parsed message')
    t.end()
  })

  t.test('should not call callback if smessage subscribedChannel does not match channel in cluster mode', async (t) => {
    const config = { cluster: [{ host: '127.0.0.1', port: 6379 }] }
    const ssubscribeStub = sandbox.stub().resolves()
    const onStub = sandbox.stub().withArgs('smessage').yields('other-cluster-channel', JSON.stringify({ key: 'cluster-value' }))
    const pubSub = new PubSub(
      config,
      publisherClientStub,
      {
        ...subscriberClientStub,
        ssubscribe: ssubscribeStub,
        on: onStub
      }
    )
    const channel = 'cluster-channel'
    const callback = sinon.stub()

    await pubSub.subscribe(channel, callback)

    t.ok(pubSub.subscriberClient.ssubscribe.calledWith(channel), 'ssubscribe called with correct channel')
    t.notOk(callback.called, 'callback not called when smessage channel does not match')
    t.end()
  })

  t.test('should handle error when subscribing to a channel in cluster mode', async (t) => {
    const config = { cluster: [{ host: '127.0.0.1', port: 6379 }] }
    const error = new Error('Cluster subscribe error')
    const subscriberClient = {
      ...subscriberClientStub,
      ssubscribe: sandbox.stub().rejects(error)
    }
    const pubSub = new PubSub(config, publisherClientStub, subscriberClient)
    const channel = 'cluster-channel'
    const callback = sinon.stub()

    try {
      await pubSub.subscribe(channel, callback)
      t.fail('Should have thrown an error')
    } catch (err) {
      t.deepEqual(err, constructSystemExtensionError(error, '["redis"]'), 'Error thrown and rethrown correctly')
    }
    t.end()
  })

  t.test('should unsubscribe from a channel using sunsubscribe in cluster mode', async (t) => {
    const config = { cluster: [{ host: '127.0.0.1', port: 6379 }] }
    const subscriberClient = {
      ...subscriberClientStub,
      sunsubscribe: sandbox.stub().resolves()
    }
    const pubSub = new PubSub(config, publisherClientStub, subscriberClient)
    const channel = 'cluster-channel'

    await pubSub.unsubscribe(channel)

    t.ok(pubSub.subscriberClient.sunsubscribe.calledWith(channel), 'sunsubscribe called with correct channel')
    t.end()
  })

  t.test('should handle error when unsubscribing from a channel in cluster mode', async (t) => {
    const config = { cluster: [{ host: '127.0.0.1', port: 6379 }] }
    const error = new Error('Cluster unsubscribe error')
    const subscriberClient = {
      ...subscriberClientStub,
      sunsubscribe: sandbox.stub().rejects(error)
    }
    const pubSub = new PubSub(config, publisherClientStub, subscriberClient)
    const channel = 'cluster-channel'

    try {
      await pubSub.unsubscribe(channel)
      t.fail('Should have thrown an error')
    } catch (err) {
      t.deepEqual(err, constructSystemExtensionError(error, '["redis"]'), 'Error thrown and rethrown correctly')
    }
    t.end()
  })

  t.test('should broadcast a message to multiple channels using spublish in cluster mode', async (t) => {
    const config = { cluster: [{ host: '127.0.0.1', port: 6379 }] }
    const publisherClient = {
      ...publisherClientStub,
      spublish: sandbox.stub().resolves()
    }
    const pubSub = new PubSub(config, publisherClient, subscriberClientStub)
    const channels = ['cluster1', 'cluster2']
    const message = { key: 'cluster-broadcast' }

    await pubSub.broadcast(channels, message)

    t.ok(pubSub.publisherClient.spublish.calledTwice, 'spublish called twice')
    t.ok(pubSub.publisherClient.spublish.firstCall.calledWith(channels[0], JSON.stringify(message)), 'spublish called with first channel and message')
    t.ok(pubSub.publisherClient.spublish.secondCall.calledWith(channels[1], JSON.stringify(message)), 'spublish called with second channel and message')
    t.end()
  })

  t.test('should handle error when broadcasting a message in cluster mode', async (t) => {
    const config = { cluster: [{ host: '127.0.0.1', port: 6379 }] }
    const error = new Error('Cluster broadcast error')
    // Overwrite stubs before creating pubSub and pass into constructor
    const publisherClient = {
      ...publisherClientStub,
      spublish: sandbox.stub().onFirstCall().rejects(error)
    }
    const pubSub = new PubSub(config, publisherClient, subscriberClientStub)
    const channels = ['cluster1', 'cluster2']
    const message = { key: 'cluster-broadcast' }

    try {
      await pubSub.broadcast(channels, message)
      t.fail('Should have thrown an error')
    } catch (err) {
      t.deepEqual(err, constructSystemExtensionError(error, '["redis"]'), 'Error thrown and rethrown correctly')
    }
    t.end()
  })

  t.test('should set lazyConnect to true if not provided in config when creating Redis client', (t) => {
    // Arrange
    const config = {}
    // We want to test the createRedisClient method directly, so we need a real PubSub instance
    // but we will stub Redis and Redis.Cluster constructors to observe their arguments
    const redisStub = sandbox.stub()
    const redisClusterStub = sandbox.stub()
    const PubSubWithRedisStub = Proxyquire('../../../../src/util/redis/pubSub', {
      ioredis: Object.assign(redisStub, { default: redisStub, Cluster: redisClusterStub }),
      '../createLogger': { createLogger: () => ({ info: sandbox.stub(), error: sandbox.stub(), warn: sandbox.stub(), debug: sandbox.stub() }) },
      './shared': { retryCommand: retryCommandStub }
    })

    // Act
    const pubSub = new PubSubWithRedisStub(config)
    pubSub.isCluster = false // force non-cluster mode
    pubSub.createRedisClient()

    // Assert
    t.equal(config.lazyConnect, true, 'lazyConnect is set to true in config')
    t.end()
  })

  t.test('should not overwrite lazyConnect if already set in config', (t) => {
    // Arrange
    const config = { lazyConnect: false }
    const redisStub = sandbox.stub()
    const redisClusterStub = sandbox.stub()
    const PubSubWithRedisStub = Proxyquire('../../../../src/util/redis/pubSub', {
      ioredis: Object.assign(redisStub, { default: redisStub, Cluster: redisClusterStub }),
      '../createLogger': { createLogger: () => ({ info: sandbox.stub(), error: sandbox.stub(), warn: sandbox.stub(), debug: sandbox.stub() }) },
      './shared': { retryCommand: retryCommandStub }
    })

    // Act
    const pubSub = new PubSubWithRedisStub(config)
    pubSub.isCluster = false // force non-cluster mode
    pubSub.createRedisClient()

    // Assert
    t.equal(config.lazyConnect, false, 'lazyConnect remains false in config')
    t.end()
  })

  t.test('should use Redis.Cluster constructor when isCluster is true', (t) => {
    // Arrange
    const config = { cluster: [{ host: '127.0.0.1', port: 6379 }] }
    const redisStub = sandbox.stub()
    const redisClusterClient = { on: sandbox.stub().returnsThis() }
    const redisClusterStub = sandbox.stub().returns(redisClusterClient)
    const PubSubWithRedisStub = Proxyquire('../../../../src/util/redis/pubSub', {
      ioredis: Object.assign(redisStub, { default: redisStub, Cluster: redisClusterStub }),
      '../createLogger': { createLogger: () => ({ info: sandbox.stub(), error: sandbox.stub(), warn: sandbox.stub(), debug: sandbox.stub() }) },
      './shared': { retryCommand: retryCommandStub }
    })

    // Act
    const pubSub = new PubSubWithRedisStub(config)
    pubSub.isCluster = true // force cluster mode
    pubSub.createRedisClient()

    // Assert
    t.ok(pubSub.publisherClient instanceof redisClusterClient.constructor, 'Redis.Cluster constructor called')
    t.ok(pubSub.subscriberClient instanceof redisClusterClient.constructor, 'Redis.Cluster constructor called for subscriber')
    t.end()
  })

  t.test('should use Redis constructor when isCluster is false', (t) => {
    // Arrange
    const config = {}
    const redisStub = sandbox.stub()
    const redisClusterStub = sandbox.stub()
    const PubSubWithRedisStub = Proxyquire('../../../../src/util/redis/pubSub', {
      ioredis: Object.assign(redisStub, { default: redisStub, Cluster: redisClusterStub }),
      '../createLogger': { createLogger: () => ({ info: sandbox.stub(), error: sandbox.stub(), warn: sandbox.stub(), debug: sandbox.stub() }) },
      './shared': { retryCommand: retryCommandStub }
    })

    // Act
    const pubSub = new PubSubWithRedisStub(config)
    pubSub.isCluster = false // force non-cluster mode
    pubSub.createRedisClient()

    // Assert
    t.ok(pubSub.publisherClient instanceof redisStub, 'Redis constructor called for publisher')
    t.ok(pubSub.subscriberClient instanceof redisStub, 'Redis constructor called for subscriber')
    t.end()
  })

  t.test('should call connect on client if not connected in ensureConnected', async (t) => {
    const config = {}
    const notConnectedClient = {
      ...publisherClientStub,
      status: 'disconnected',
      connect: sandbox.stub().resolves()
    }
    const pubSub = new PubSub(config, notConnectedClient, subscriberClientStub)
    await pubSub.ensureConnected(notConnectedClient)
    t.ok(notConnectedClient.connect.calledOnce, 'connect called when client is not connected')
    t.end()
  })

  t.test('should not call connect on client if already connected in ensureConnected', async (t) => {
    const config = {}
    const connectedClient = {
      ...publisherClientStub,
      status: 'ready',
      connect: sandbox.stub().resolves()
    }
    const pubSub = new PubSub(config, connectedClient, subscriberClientStub)
    await pubSub.ensureConnected(connectedClient)
    t.notOk(connectedClient.connect.called, 'connect not called when client is already connected')
    t.end()
  })

  t.test('should handle error in ensureConnected and rethrow', async (t) => {
    const config = {}
    const error = new Error('Reconnect error')
    const notConnectedClient = {
      ...publisherClientStub,
      status: 'disconnected',
      connect: sandbox.stub().rejects(error)
    }
    const pubSub = new PubSub(config, notConnectedClient, subscriberClientStub)
    // Patch retryCommand to throw
    retryCommandStub.callsFake(async () => { throw error })
    try {
      await pubSub.ensureConnected(notConnectedClient)
      t.fail('Should have thrown an error')
    } catch (err) {
      t.equal(err, error, 'Error is rethrown from ensureConnected')
    }
    t.end()
  })

  t.test('should remove event listener object from _channelListeners on unsubscribe', async (t) => {
    const config = {}
    const pubSub = new PubSub(config, publisherClientStub, subscriberClientStub)
    const channel = 'test-channel'
    const callback = sinon.stub()
    // Subscribe to add listener
    await pubSub.subscribe(channel, callback)
    t.ok(pubSub._channelListeners.has(channel), '_channelListeners has channel after subscribe')
    // Unsubscribe should remove listener object
    await pubSub.unsubscribe(channel)
    t.notOk(pubSub._channelListeners.has(channel), '_channelListeners does not have channel after unsubscribe')
    t.end()
  })

  t.test('should remove event listener object from _channelListeners on unsubscribe in cluster mode', async (t) => {
    const config = { cluster: [{ host: '127.0.0.1', port: 6379 }] }
    const subscriberClient = {
      ...subscriberClientStub,
      ssubscribe: sandbox.stub().resolves(),
      sunsubscribe: sandbox.stub().resolves(),
      on: sandbox.stub().returnsThis(),
      removeListener: sandbox.stub()
    }
    const pubSub = new PubSub(config, publisherClientStub, subscriberClient)
    const channel = 'cluster-channel'
    const callback = sinon.stub()
    // Subscribe to add listener
    await pubSub.subscribe(channel, callback)
    t.ok(pubSub._channelListeners.has(channel), '_channelListeners has channel after subscribe (cluster)')
    // Unsubscribe should remove listener object
    await pubSub.unsubscribe(channel)
    t.notOk(pubSub._channelListeners.has(channel), '_channelListeners does not have channel after unsubscribe (cluster)')
    t.end()
  })
  t.end()
})
