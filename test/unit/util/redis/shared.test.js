const Test = require('tapes')(require('tape'))
const sinon = require('sinon')
const shared = require('../../../../src/util/redis/shared')

Test('shared.js', (t) => {
  t.test('should export retryCommand', (assert) => {
    assert.equal(typeof shared.retryCommand, 'function', 'retryCommand should be a function')
    assert.end()
  })

  t.test('retryCommand - resolves on first try', async (assert) => {
    const fn = sinon.stub().resolves('success')
    const result = await shared.retryCommand(fn)
    assert.equal(result, 'success', 'Should resolve with the function result')
    assert.equal(fn.callCount, 1, 'Should call fn once')
    assert.end()
  })

  t.test('retryCommand - retries on failure and succeeds', async (assert) => {
    const fn = sinon.stub()
    fn.onCall(0).rejects(new Error('fail 1'))
    fn.onCall(1).resolves('ok')
    const log = { warn: sinon.spy() }
    const result = await shared.retryCommand(fn, log, 3, 10)
    assert.equal(result, 'ok', 'Should resolve with the function result after retry')
    assert.equal(fn.callCount, 2, 'Should call fn twice')
    assert.ok(log.warn.calledOnce, 'Should log warning once')
    assert.match(log.warn.firstCall.args[0], /Retrying Redis command/, 'Should log retry message')
    assert.end()
  })

  t.test('retryCommand - retries up to attempts and throws', async (assert) => {
    const fn = sinon.stub().rejects(new Error('fail always'))
    const log = { warn: sinon.spy() }
    try {
      await shared.retryCommand(fn, log, 2, 10)
      assert.fail('Should throw after all attempts')
    } catch (err) {
      assert.equal(err.message, 'fail always', 'Should throw the last error')
      assert.equal(fn.callCount, 2, 'Should call fn for each attempt')
      assert.equal(log.warn.callCount, 2, 'Should log warning for each failure')
    }
    assert.end()
  })

  t.test('retryCommand - does not log if log is not provided', async (assert) => {
    const fn = sinon.stub()
    fn.onCall(0).rejects(new Error('fail'))
    fn.onCall(1).resolves('ok')
    const result = await shared.retryCommand(fn, undefined, 2, 10)
    assert.equal(result, 'ok', 'Should resolve with the function result')
    assert.end()
  })

  t.end()
})
