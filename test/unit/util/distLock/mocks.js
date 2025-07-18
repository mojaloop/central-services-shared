const sinon = require('sinon')
const { logger } = require('#src/logger')

const mockRedis = sinon.stub()
const mockCluster = sinon.stub()
mockRedis.Cluster = mockCluster

const mockRedlock = sinon.stub().returns({
  acquire: async () => ({ value: 'test-lock-value' }),
  release: async () => {},
  extend: async () => ({ value: 'test-lock-extend-value' }),
  on: () => {}
})

const mockLogger = logger.child({ context: 'tests' })

const mockConfig = {
  redisConfigs: [
    {
      type: 'redis',
      host: 'localhost',
      port: 6379
    }
  ],
  driftFactor: 0.01,
  retryCount: 3,
  retryDelay: 200,
  retryJitter: 100
}

module.exports = { mockRedis, mockCluster, mockConfig, mockLogger, mockRedlock }
