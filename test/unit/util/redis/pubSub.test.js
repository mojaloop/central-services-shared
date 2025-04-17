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
    t.ok(pubSub.publisherClient instanceof Redis, 'publisherClient is an instance of Redis')
    t.ok(pubSub.subscriberClient instanceof Redis, 'subscriberClient is an instance of Redis')
    t.end()
  })

  t.test('should publish a message to a channel', async (t) => {
    const config = {}
    const pubSub = new PubSub(config)
    const channel = 'test-channel'
    const message = { key: 'value' }
    await pubSub.publish(channel, message)

    t.ok(pubSub.publisherClient.publish.calledWith(channel, JSON.stringify(message)), 'publish called with correct arguments')
    t.end()
  })

  t.test('should handle error when publishing a message', async (t) => {
    const config = {}
    const pubSub = new PubSub(config)
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

    t.ok(pubSub.publisherClient.publish.calledTwice, 'publish called twice')
    t.ok(pubSub.publisherClient.publish.firstCall.calledWith(channels[0], JSON.stringify(message)), 'publish called with first channel and message')
    t.ok(pubSub.publisherClient.publish.secondCall.calledWith(channels[1], JSON.stringify(message)), 'publish called with second channel and message')
    t.end()
  })

  t.test('should handle error when broadcasting a message', async (t) => {
    const config = {}
    const pubSub = new PubSub(config)
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
    const pubSub = new PubSub(config)

    sandbox.stub(pubSub.publisherClient, 'connect').resolves()
    sandbox.stub(pubSub.subscriberClient, 'connect').resolves()

    await pubSub.connect()

    t.ok(pubSub.publisherClient.connect.calledOnce, 'publisherClient connect called once')
    t.ok(pubSub.subscriberClient.connect.calledOnce, 'subscriberClient connect called once')
    t.end()
  })

  t.test('should handle error when connecting Redis clients', async (t) => {
    const config = {}
    const pubSub = new PubSub(config)
    const error = new Error('Connect error')

    sandbox.stub(pubSub.publisherClient, 'connect').rejects(error)
    sandbox.stub(pubSub.subscriberClient, 'connect').resolves()

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
    const pubSub = new PubSub(config)

    t.ok(pubSub.publisherClient instanceof Redis.Cluster, 'publisherClient is an instance of Redis.Cluster')
    t.ok(pubSub.subscriberClient instanceof Redis.Cluster, 'subscriberClient is an instance of Redis.Cluster')
    t.end()
  })

  t.test('should connect Redis Cluster clients successfully', async (t) => {
    const config = { cluster: [{ host: '127.0.0.1', port: 6379 }] }
    const pubSub = new PubSub(config)

    sandbox.stub(pubSub.publisherClient, 'connect').resolves()
    sandbox.stub(pubSub.subscriberClient, 'connect').resolves()

    await pubSub.connect()

    t.ok(pubSub.publisherClient.connect.calledOnce, 'publisherClient connect called once')
    t.ok(pubSub.subscriberClient.connect.calledOnce, 'subscriberClient connect called once')
    t.end()
  })

  t.test('should handle error when connecting Redis Cluster clients', async (t) => {
    const config = { cluster: [{ host: '127.0.0.1', port: 6379 }] }
    const pubSub = new PubSub(config)
    const error = new Error('Cluster connect error')

    sandbox.stub(pubSub.publisherClient, 'connect').rejects(error)
    sandbox.stub(pubSub.subscriberClient, 'connect').resolves()

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
    const pubSub = new PubSub(config)
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
    const pubSub = new PubSub(config)

    sandbox.stub(pubSub.publisherClient, 'quit').resolves()
    sandbox.stub(pubSub.subscriberClient, 'quit').resolves()
    sandbox.stub(pubSub.subscriberClient, 'removeAllListeners').resolves()

    await pubSub.disconnect()

    t.ok(pubSub.publisherClient.quit.calledOnce, 'publisherClient quit called once')
    t.ok(pubSub.subscriberClient.quit.calledOnce, 'subscriberClient quit called once')
    t.ok(pubSub.subscriberClient.removeAllListeners.calledOnce, 'subscriberClient removeAllListeners called once')
    t.end()
  })

  t.test('should handle error when disconnecting Redis clients', async (t) => {
    const config = {}
    const pubSub = new PubSub(config)
    const error = new Error('Disconnect error')

    sandbox.stub(pubSub.publisherClient, 'quit').rejects(error)
    sandbox.stub(pubSub.subscriberClient, 'quit').resolves()

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
    const pubSub = new PubSub(config)

    sandbox.stub(pubSub.publisherClient, 'ping').resolves('PONG')
    sandbox.stub(pubSub.subscriberClient, 'ping').resolves('PONG')

    const isHealthy = await pubSub.healthCheck()

    t.equal(isHealthy, true, 'healthCheck returns true when both clients are healthy')
    t.ok(pubSub.publisherClient.ping.calledOnce, 'publisherClient ping called once')
    t.ok(pubSub.subscriberClient.ping.calledOnce, 'subscriberClient ping called once')
    t.end()
  })

  t.test('should perform health check and return false if any client is unhealthy', async (t) => {
    const config = {}
    const pubSub = new PubSub(config)

    sandbox.stub(pubSub.publisherClient, 'ping').resolves('PONG')
    sandbox.stub(pubSub.subscriberClient, 'ping').resolves('ERROR')

    const isHealthy = await pubSub.healthCheck()

    t.equal(isHealthy, false, 'healthCheck returns false when any client is unhealthy')
    t.ok(pubSub.publisherClient.ping.calledOnce, 'publisherClient ping called once')
    t.ok(pubSub.subscriberClient.ping.calledOnce, 'subscriberClient ping called once')
    t.end()
  })

  t.test('should handle error during health check and return false', async (t) => {
    const config = {}
    const pubSub = new PubSub(config)
    const error = new Error('Health check error')

    sandbox.stub(pubSub.publisherClient, 'ping').rejects(error)
    sandbox.stub(pubSub.subscriberClient, 'ping').resolves('PONG')

    const isHealthy = await pubSub.healthCheck()

    t.equal(isHealthy, false, 'healthCheck returns false when an error occurs')
    t.ok(pubSub.publisherClient.ping.calledOnce, 'publisherClient ping called once')
    t.notOk(pubSub.subscriberClient.ping.calledOnce, 'subscriberClient ping not called once')
    t.end()
  })

  t.test('should return correct connection statuses for isConnected', (t) => {
    const config = {}
    const pubSub = new PubSub(config)

    sandbox.stub(pubSub.publisherClient, 'status').value('ready')
    sandbox.stub(pubSub.subscriberClient, 'status').value('ready')

    const connectionStatus = pubSub.isConnected

    t.deepEqual(connectionStatus, { publisherConnected: true, subscriberConnected: true }, 'isConnected returns correct statuses')
    t.end()
  })

  t.test('should return false connection statuses for isConnected when clients are not connected', (t) => {
    const config = {}
    const pubSub = new PubSub(config)

    sandbox.stub(pubSub.publisherClient, 'status').value('disconnected')
    sandbox.stub(pubSub.subscriberClient, 'status').value('disconnected')

    const connectionStatus = pubSub.isConnected

    t.deepEqual(connectionStatus, { publisherConnected: false, subscriberConnected: false }, 'isConnected returns false statuses when clients are not connected')
    t.end()
  })
  t.end()
})
