const RC = require('rc')('CLEDG', require('./default.json'))

module.exports = {
  ENDPOINT_SOURCE_URL: RC.ENDPOINT_SOURCE_URL,
  ENDPOINT_CACHE_CONFIG: RC.ENDPOINT_CACHE_CONFIG,
  KAFKA_CONFIG: RC.KAFKA
}
