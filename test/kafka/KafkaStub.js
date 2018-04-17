'use strict'
const EventEmitter = require('events')
const Logger = require('../../src/logger').Logger

const metadataSampleStub = {
  orig_broker_id: 1,
  orig_broker_name: 'stub-broker',
  brokers: [
    {
      id: 0,
      host: 'localhost',
      port: 9092
    }
  ],
  topics: [
    {
      name: 'test',
      partitions: [
        {
          id: 0,
          leader: 0,
          replicas: [1],
          isrs: [1]
        }
      ]
    }
  ]
}

const watermarkOffsetSampleStub = {
  high: 10,
  low: 0
}

const messageSampleStub = {
  value: null,
  topic: 'test',
  partition: 0,
  offset: 1,
  key: 'key',
  size: 0,
  timestamp: (new Date()).getTime()
}

// KafkaClient Stub
class KafkaClient extends EventEmitter {
  connect (err, info) {
    if (err) {
      Logger.error(err)
    }
    this.emit('ready', 'true')
    this.metrics = {}
    this.metrics.connectionOpened = Date.now()
    this.name = 'KafkaStub'
  }

  disconnect (cb = (err, metrics) => {
    if (err) {
      Logger.error(err)
    }
  }) {
    cb(null, this.metrics)
  }

  getMetadata (metadataOptions, cb = (err, metadata) => {
    if (err) {
      Logger.error(err)
    }
  }) {
    var metadataSample = {...metadataSampleStub}

    if (cb) {
      cb(null, metadataSample)
    }
  }
}

// KafkaConsumer Stub
class KafkaConsumer extends KafkaClient {
  setDefaultConsumeTimeout (timeoutMs) {
  }

  subscribe (topics) {
    return topics
  }

  consume (number, cb) {
    if ((number && typeof number === 'number') || (number && cb)) {
      if (cb === undefined) {
        cb = function () {}
      } else if (typeof cb !== 'function') {
        throw new TypeError('Callback must be a function')
      }
    } else {
      // See https://github.com/Blizzard/node-rdkafka/issues/220
      // Docs specify just a callback can be provided but really we needed
      // a fallback to the number argument
      // @deprecated
      if (cb === undefined) {
        if (typeof number === 'function') {
          cb = number
        } else {
          cb = function () {}
        }
      }
    }

    const encoding = 'utf8'

    const bufferedMessage = Buffer.from(JSON.stringify({
      hello: 'world'
    }), encoding)

    const messageSample = {
      value: bufferedMessage,
      topic: 'test',
      partition: 0,
      offset: 1,
      key: 'key',
      size: bufferedMessage.length,
      timestamp: (new Date()).getTime()
    }

    if (number > 0) {
      var messageBatchSample = [0, 1, 2, 3, 4, 5, 6, 7, 9]

      messageBatchSample = messageBatchSample.map(index => {
        var newMessageSample = {...messageSample}
        newMessageSample.key = index
        newMessageSample.offset = index
        newMessageSample.timestamp = (new Date()).getTime()
        return newMessageSample
      })

      cb(null, messageBatchSample)
      this.emit('batch', messageBatchSample)
    }
    const copyOfMessageSample = {...messageSample}
    // var copyOfMessageSample = {}
    // Object.assign(copyOfMessageSample, messageSample)
    cb(null, messageSample)
    this.emit('data', copyOfMessageSample)
  }

  commit (topicPartition) {
    return topicPartition
  }

  commitMessage (msg) {
    return msg
  }

  commitSync (topicPartition) {
    return topicPartition
  }

  commitMessageSync (msg) {
    return msg
  }

  getWatermarkOffsets (topic, partition) {
    var watermarkOffsetSample = {...watermarkOffsetSampleStub}
    return watermarkOffsetSample
  }

  resume (topicPartitions) {
  }

  pause (topicPartitions) {
  }
}

exports.metadataSampleStub = metadataSampleStub
exports.watermarkOffsetSampleStub = watermarkOffsetSampleStub
exports.messageSampleStub = messageSampleStub
exports.KafkaClient = KafkaClient
exports.KafkaConsumer = KafkaConsumer
