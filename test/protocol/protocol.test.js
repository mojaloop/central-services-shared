const Test = require('tapes')(require('tape'))
const Protocol = require('../../src/kafka/protocol')
 const Logger = require('../../src/logger')
const Sinon = require('sinon')

let reason = {}
let metadata = {}
let parseM = {}
let parseC = {}
let parseN = {}

reason = {
  code: 'code',
  description: 'description'
}

metadata = {
  resource: 'metadata'
}

parseM = {
  from: 'from',
  to: 'to',
  id: 'key',
  content: 'message',
  type: 'type',
  metadata: 'metadata',
  pp: ''
}
parseC = {
  from: 'from',
  to: 'to',
  id: 'key',
  resource: 'message',
  type: 'type',
  metadata: 'metadata',
  pp: '',
  method: 'method',
  uri: '',
  status: 'status',
  reason: {
    code: 'code',
    description: 'description'
  }
}

parseN = {
  from: 'from',
  to: 'to',
  id: 'key',
  type: 'type',
  metadata: 'metadata',
  pp: '',
  event: 'event',
  reason: {
    code: 'code',
    description: 'description'
  }
}

Test('Protocol::parseCommand', function (assert) {
  var test = Protocol.parseCommand(parseC.from, parseC.to, parseC.id, parseC.resource, parseC.resource, parseC.method, metadata, parseC.status, parseC.type)
  // Logger.debug(test)
  assert.ok(Sinon.match(test, parseC))
  assert.end()
})

Test('Protocol::parseMessage', function (assert) {
  var test = Protocol.parseMessage(parseM.from, parseM.to, parseM.id, parseM.content, parseM.type, metadata)
    Logger.debug(test)
  assert.ok(Sinon.match(test, parseM))
  assert.end()
})

Test('Protocol::parseMessage', function (assert) {
  var test = Protocol.parseMessage(parseM.from, parseM.to, parseM.id, parseM.content, parseM.type, metadata, parseM.pp)
   Logger.debug(test)
  assert.ok(Sinon.match(test, parseM))
  assert.end()
})
Test('Protocol::parseNotify', function (assert) {
  var test = Protocol.parseNotify(parseN.from, parseN.to, parseN.id, 'message', metadata, parseN.event, reason, parseN.type)
   // Logger.debug(test)
  assert.ok(Sinon.match(test, parseN))
  assert.end()
})

Test('Protocol::parseValue', function (assert) {
  var buf = Buffer.from(JSON.stringify(reason), 'utf8')
  var test = Protocol.parseValue(buf)
  // Logger.debug(test)
  assert.ok(Sinon.match(test, reason))
  assert.end()
})

Test('Protocol::parseValue', function (assert) {
  var buf = Buffer.from(JSON.stringify(reason), 'utf8')
  var test = Protocol.parseValue(buf, 'utf8', false)
  // Logger.debug(test)
  assert.ok(Sinon.match(test, '{"code":"code","description":"description"}'))
  assert.end()
})
