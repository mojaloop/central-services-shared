*Example Consumer*

```JSON

'use strict'

const Producer = require('central-services-shared').Kafka.Producer
const Logger = require('central-services-shared').Logger

var testProducer = async () => {
  Logger.info('testProducer::start')

  var p = new Producer()
  Logger.info('testProducer::connect::start')
  var connectionResult = await p.connect()
  Logger.info('testProducer::connect::end')

  Logger.info(`Connected result=${connectionResult}`)

  Logger.info('testProducer::sendMessage::start1')
  await p.sendMessage('test', {test: 'test'}, '1234', 'testAccountSender', 'testAccountReciever', {date: new Date()}, 'application/json', ' ').then(results => {
    Logger.info(`testProducer.sendMessage:: result:'${JSON.stringify(results)}'`)
  })
  Logger.info('testProducer::sendMessage::end1')
}

testProducer()
```
