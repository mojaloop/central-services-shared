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

 * Kevin Leyow <kevin.leyow@infitx.com>

 --------------
 ******/
const Test = require('tapes')(require('tape'))
const sinon = require('sinon')
let PubSub = require('../../../../src/util/redis/pubSub')
const proxyquire = require('proxyquire')

Test('PubSub', pubSubTest => {
  let sandbox, publisherStub, subscriberStub, pubSub, logStub

  pubSubTest.beforeEach(t => {
    sandbox = sinon.createSandbox()
    logStub = {
      info: sandbox.stub(),
      error: sandbox.stub(),
      debug: sandbox.stub()
    }
    publisherStub = {
      connect: sandbox.stub().resolves(),
      quit: sandbox.stub().resolves(),
      ping: sandbox.stub().resolves('PONG'),
      publish: sandbox.stub().resolves(),
      spublish: undefined,
      isOpen: true,
      on: sandbox.stub().returnsThis(),
      removeAllListeners: sandbox.stub()
    }
    subscriberStub = {
      connect: sandbox.stub().resolves(),
      quit: sandbox.stub().resolves(),
      ping: sandbox.stub().resolves('PONG'),
      subscribe: sandbox.stub().resolves(),
      unsubscribe: sandbox.stub().resolves(),
      ssubscribe: undefined,
      sunsubscribe: undefined,
      isOpen: true,
      on: sandbox.stub().returnsThis(),
      removeAllListeners: sandbox.stub()
    }
    sandbox.stub(require('../../../../src/util/createLogger'), 'createLogger').returns(logStub)
    t.end()
  })

  pubSubTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  pubSubTest.test('should connect publisher and subscriber clients', async t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    await pubSub.connect()
    t.ok(publisherStub.connect.called, 'publisher connect called')
    t.ok(subscriberStub.connect.called, 'subscriber connect called')
    t.end()
  })

  pubSubTest.test('should disconnect publisher and subscriber clients', async t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    await pubSub.disconnect()
    t.ok(publisherStub.quit.called, 'publisher quit called')
    t.ok(subscriberStub.quit.called, 'subscriber quit called')
    t.ok(subscriberStub.removeAllListeners.called, 'subscriber removeAllListeners called')
    t.end()
  })

  pubSubTest.test('should return true on healthy healthCheck', async t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    const result = await pubSub.healthCheck()
    t.equal(result, true, 'healthCheck returns true')
    t.ok(publisherStub.ping.called, 'publisher ping called')
    t.ok(subscriberStub.ping.called, 'subscriber ping called')
    t.end()
  })

  pubSubTest.test('should return false on unhealthy healthCheck', async t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    publisherStub.ping.rejects(new Error('fail'))
    const result = await pubSub.healthCheck()
    t.equal(result, false, 'healthCheck returns false')
    t.end()
  })

  pubSubTest.test('should return isConnected status', t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    const status = pubSub.isConnected
    t.deepEqual(status, { publisherConnected: true, subscriberConnected: true }, 'isConnected returns correct status')
    t.end()
  })

  pubSubTest.test('should publish message to channel', async t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    await pubSub.publish('test-channel', { foo: 'bar' })
    t.ok(publisherStub.publish.calledWith('test-channel', JSON.stringify({ foo: 'bar' })), 'publish called with correct args')
    t.end()
  })

  pubSubTest.test('should publish message using spublish in cluster mode', async t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    pubSub.isCluster = true
    publisherStub.spublish = sandbox.stub().resolves()
    await pubSub.publish('test-channel', { foo: 'bar' })
    t.ok(publisherStub.spublish.calledWith('test-channel', JSON.stringify({ foo: 'bar' })), 'spublish called with correct args')
    t.end()
  })

  pubSubTest.test('should subscribe to channel', async t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    const callback = sandbox.stub()
    await pubSub.subscribe('test-channel', callback)
    t.ok(subscriberStub.subscribe.called, 'subscribe called')
    t.end()
  })

  pubSubTest.test('should subscribe using ssubscribe in cluster mode', async t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    pubSub.isCluster = true
    subscriberStub.ssubscribe = sandbox.stub().resolves()
    const callback = sandbox.stub()
    await pubSub.subscribe('test-channel', callback)
    t.ok(subscriberStub.ssubscribe.called, 'ssubscribe called')
    t.end()
  })

  pubSubTest.test('should unsubscribe from channel', async t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    await pubSub.unsubscribe('test-channel')
    t.ok(subscriberStub.unsubscribe.calledWith('test-channel'), 'unsubscribe called')
    t.end()
  })

  pubSubTest.test('should unsubscribe using sunsubscribe in cluster mode', async t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    pubSub.isCluster = true
    subscriberStub.sunsubscribe = sandbox.stub().resolves()
    await pubSub.unsubscribe('test-channel')
    t.ok(subscriberStub.sunsubscribe.calledWith('test-channel'), 'sunsubscribe called')
    t.end()
  })

  pubSubTest.test('should broadcast message to multiple channels', async t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    sandbox.stub(pubSub, 'publish').resolves()
    await pubSub.broadcast(['a', 'b'], { foo: 'bar' })
    t.ok(pubSub.publish.calledTwice, 'publish called for each channel')
    t.end()
  })

  pubSubTest.test('should handle error on connect', async t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    publisherStub.connect.rejects(new Error('connect error'))
    try {
      await pubSub.connect()
      t.fail('Expected error not thrown')
    } catch (err) {
      t.match(err.message, /connect error/, 'throws error on connect failure')
    }
    t.end()
  })

  pubSubTest.test('should handle error on disconnect', async t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    publisherStub.quit.rejects(new Error('disconnect error'))
    try {
      await pubSub.disconnect()
      t.fail('Expected error not thrown')
    } catch (err) {
      t.match(err.message, /disconnect error/, 'throws error on disconnect failure')
    }
    t.end()
  })

  pubSubTest.test('should handle error on publish', async t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    publisherStub.publish.rejects(new Error('publish error'))
    try {
      await pubSub.publish('chan', { a: 1 })
      t.fail('Expected error not thrown')
    } catch (err) {
      t.match(err.message, /publish error/, 'throws error on publish failure')
    }
    t.end()
  })

  pubSubTest.test('should handle error on subscribe', async t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    subscriberStub.subscribe.rejects(new Error('subscribe error'))
    try {
      await pubSub.subscribe('chan', () => {})
      t.fail('Expected error not thrown')
    } catch (err) {
      t.match(err.message, /subscribe error/, 'throws error on subscribe failure')
    }
    t.end()
  })

  pubSubTest.test('should handle error on unsubscribe', async t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    subscriberStub.unsubscribe.rejects(new Error('unsubscribe error'))
    try {
      await pubSub.unsubscribe('chan')
      t.fail('Expected error not thrown')
    } catch (err) {
      t.match(err.message, /unsubscribe error/, 'throws error on unsubscribe failure')
    }
    t.end()
  })

  pubSubTest.test('should handle error on broadcast', async t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    sandbox.stub(pubSub, 'publish').rejects(new Error('broadcast error'))
    try {
      await pubSub.broadcast(['a', 'b'], { foo: 'bar' })
      t.fail('Expected error not thrown')
    } catch (err) {
      t.match(err.message, /broadcast error/, 'throws error on broadcast failure')
    }
    t.end()
  })

  pubSubTest.test('should call callback with parsed message on subscribe', async t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    let received
    subscriberStub.subscribe.callsFake(async (channel, cb) => {
      cb(JSON.stringify({ test: 1 }), channel)
    })
    await pubSub.subscribe('chan', msg => { received = msg })
    t.same(received, { test: 1 }, 'callback called with parsed message')
    t.end()
  })

  pubSubTest.test('should call callback with parsed message on ssubscribe in cluster mode', async t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    pubSub.isCluster = true
    let received
    subscriberStub.ssubscribe = sandbox.stub().callsFake(async (channel, cb) => {
      cb(JSON.stringify({ test: 2 }), channel)
    })
    await pubSub.subscribe('chan', msg => { received = msg })
    t.same(received, { test: 2 }, 'callback called with parsed message')
    t.end()
  })

  pubSubTest.test('should not call callback if subscribedChannel does not match', async t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    let called = false
    subscriberStub.subscribe.callsFake(async (channel, cb) => {
      cb(JSON.stringify({ test: 3 }), 'other-channel')
    })
    await pubSub.subscribe('chan', () => { called = true })
    t.notOk(called, 'callback not called for other channel')
    t.end()
  })

  pubSubTest.test('should add event listeners to publisher and subscriber clients', t => {
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)

    // The event listeners are added in the constructor
    // We check that .on was called with the correct events for both clients
    const expectedEvents = ['connect', 'ready', 'end', 'error']
    for (const event of expectedEvents) {
      t.ok(
        publisherStub.on.calledWith(event, sinon.match.func),
        `publisherStub.on called with event '${event}'`
      )
      t.ok(
        subscriberStub.on.calledWith(event, sinon.match.func),
        `subscriberStub.on called with event '${event}'`
      )
    }
    t.end()
  })

  pubSubTest.test('should create publisher and subscriber clients if not provided', t => {
    // Arrange
    const config = { host: 'localhost', port: 6379 }
    // Stub createClient and createLogger
    const createClientStub = sandbox.stub(require('redis'), 'createClient').returns({
      connect: sandbox.stub().resolves(),
      quit: sandbox.stub().resolves(),
      ping: sandbox.stub().resolves('PONG'),
      publish: sandbox.stub().resolves(),
      isOpen: true,
      on: sandbox.stub().returnsThis(),
      removeAllListeners: sandbox.stub()
    })
    PubSub = proxyquire('../../../../src/util/redis/pubSub', {
      redis: {
        createClient: createClientStub
      }
    })
    // Act
    const pubSub = new PubSub(config)
    // Assert
    t.ok(createClientStub.calledTwice, 'createClient called for both publisher and subscriber')
    t.ok(pubSub.publisherClient, 'publisherClient is created')
    t.ok(pubSub.subscriberClient, 'subscriberClient is created')
    t.end()
  })

  pubSubTest.test('should create cluster clients if cluster config is provided and clients not provided', async t => {
    // Arrange
    const clusterConfig = { cluster: [{ host: 'c1', port: 7000 }, { host: 'c2', port: 7001 }] }
    const createClusterStub = sandbox.stub().callsFake(() => ({
      connect: sandbox.stub().resolves(),
      quit: sandbox.stub().resolves(),
      ping: sandbox.stub().resolves('PONG'),
      spublish: sandbox.stub().resolves(),
      ssubscribe: sandbox.stub().resolves(),
      sunsubscribe: sandbox.stub().resolves(),
      isOpen: true,
      on: sandbox.stub().returnsThis(),
      removeAllListeners: sandbox.stub()
    }))

    PubSub = proxyquire('../../../../src/util/redis/pubSub', {
      redis: {
        createCluster: createClusterStub
      }
    })

    // Act
    const pubSubCluster = new PubSub(clusterConfig)
    // Assert
    t.ok(createClusterStub.calledTwice, 'createCluster called for both publisher and subscriber')
    t.ok(pubSubCluster.isCluster, 'isCluster is true')
    t.end()
  })

  pubSubTest.test('should log info on publisher client connect event', t => {
    logStub = {
      info: sandbox.stub(),
      error: sandbox.stub(),
      debug: sandbox.stub()
    }
    PubSub = proxyquire('../../../../src/util/redis/pubSub', {
      '../createLogger': { createLogger: sandbox.stub().returns(logStub) }
    })
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)
    // Find the connect event handler
    const connectHandler = publisherStub.on.getCalls().find(call => call.args[0] === 'connect').args[1]
    connectHandler()
    t.ok(logStub.info.calledWith('Redis client connecting'), 'logs info on connect')
    t.end()
  })

  pubSubTest.test('should log info on publisher client ready event', t => {
    logStub = {
      info: sandbox.stub(),
      error: sandbox.stub(),
      debug: sandbox.stub()
    }
    PubSub = proxyquire('../../../../src/util/redis/pubSub', {
      '../createLogger': { createLogger: sandbox.stub().returns(logStub) }
    })
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)
    const readyHandler = publisherStub.on.getCalls().find(call => call.args[0] === 'ready').args[1]
    readyHandler()
    t.ok(logStub.info.calledWith('Redis client ready'), 'logs info on ready')
    t.end()
  })

  pubSubTest.test('should log info on publisher client end event', t => {
    logStub = {
      info: sandbox.stub(),
      error: sandbox.stub(),
      debug: sandbox.stub()
    }
    PubSub = proxyquire('../../../../src/util/redis/pubSub', {
      '../createLogger': { createLogger: sandbox.stub().returns(logStub) }
    })
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)
    const endHandler = publisherStub.on.getCalls().find(call => call.args[0] === 'end').args[1]
    endHandler()
    t.ok(logStub.info.calledWith('Redis client connection closed'), 'logs info on end')
    t.end()
  })

  pubSubTest.test('should log error on publisher client error event', t => {
    logStub = {
      info: sandbox.stub(),
      error: sandbox.stub(),
      debug: sandbox.stub()
    }
    PubSub = proxyquire('../../../../src/util/redis/pubSub', {
      '../createLogger': { createLogger: sandbox.stub().returns(logStub) }
    })
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)
    const errorHandler = publisherStub.on.getCalls().find(call => call.args[0] === 'error').args[1]
    const err = new Error('test error')
    errorHandler(err)
    t.ok(logStub.error.calledWith('Redis client error:', err), 'logs error on error event')
    t.end()
  })

  pubSubTest.test('should log info on subscriber client connect event', t => {
    logStub = {
      info: sandbox.stub(),
      error: sandbox.stub(),
      debug: sandbox.stub()
    }
    PubSub = proxyquire('../../../../src/util/redis/pubSub', {
      '../createLogger': { createLogger: sandbox.stub().returns(logStub) }
    })
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)
    const connectHandler = subscriberStub.on.getCalls().find(call => call.args[0] === 'connect').args[1]
    connectHandler()
    t.ok(logStub.info.calledWith('Redis client connecting'), 'logs info on subscriber connect')
    t.end()
  })

  pubSubTest.test('should log info on subscriber client ready event', t => {
    logStub = {
      info: sandbox.stub(),
      error: sandbox.stub(),
      debug: sandbox.stub()
    }
    PubSub = proxyquire('../../../../src/util/redis/pubSub', {
      '../createLogger': { createLogger: sandbox.stub().returns(logStub) }
    })
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)
    const readyHandler = subscriberStub.on.getCalls().find(call => call.args[0] === 'ready').args[1]
    readyHandler()
    t.ok(logStub.info.calledWith('Redis client ready'), 'logs info on subscriber ready')
    t.end()
  })

  pubSubTest.test('should log info on subscriber client end event', t => {
    logStub = {
      info: sandbox.stub(),
      error: sandbox.stub(),
      debug: sandbox.stub()
    }
    PubSub = proxyquire('../../../../src/util/redis/pubSub', {
      '../createLogger': { createLogger: sandbox.stub().returns(logStub) }
    })
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)
    const endHandler = subscriberStub.on.getCalls().find(call => call.args[0] === 'end').args[1]
    endHandler()
    t.ok(logStub.info.calledWith('Redis client connection closed'), 'logs info on subscriber end')
    t.end()
  })

  pubSubTest.test('should log error on subscriber client error event', t => {
    logStub = {
      info: sandbox.stub(),
      error: sandbox.stub(),
      debug: sandbox.stub()
    }
    PubSub = proxyquire('../../../../src/util/redis/pubSub', {
      '../createLogger': { createLogger: sandbox.stub().returns(logStub) }
    })
    pubSub = new PubSub({ host: 'localhost', port: 6379 }, publisherStub, subscriberStub)
    const errorHandler = subscriberStub.on.getCalls().find(call => call.args[0] === 'error').args[1]
    const err = new Error('subscriber error')
    errorHandler(err)
    t.ok(logStub.error.calledWith('Redis client error:', err), 'logs error on subscriber error event')
    t.end()
  })
  pubSubTest.end()
})
