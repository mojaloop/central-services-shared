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

 * ModusBox
 - Georgi Georgiev <georgi.georgiev@modusbox.com>
 - Valentin Genev <valentin.genev@modusbox.com>
 --------------
 ******/
'use strict'

const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Util = require('../../../../src/util')
const Enum = require('../../../../src/enums')

const headers = {
  'FSPIOP-Source': 'source',
  'FSPIOP-Destination': 'destination'
}

const transactionType = 'transfer'
const transactionAction = 'prepare'

Test('Get tags tests', test => {
  let sandbox

  test.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    t.end()
  })

  test.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  test.test('should get tags', assert => {
    const params = {}

    const payload = {
      payerFsp: 'payerFsp',
      payeeFsp: 'payeeFsp',
      transferId: 'transferId'
    }

    const expectations = {
      transactionType: 'transfer',
      transactionAction: 'prepare',
      transactionId: 'transferId',
      source: 'source',
      destination: 'destination',
      payerFsp: 'payerFsp',
      payeeFsp: 'payeeFsp'
    }

    const result = Util.EventFramework.getTransferSpanTags({ payload, headers, params }, transactionType, transactionAction)
    assert.deepEqual(result, expectations, 'tags match')
    assert.end()
  })

  test.test('should get transfer tags', assert => {
    const params = {
      id: 'transferId'
    }

    const payload = null

    const expectations = {
      transactionType: 'transfer',
      transactionAction: 'prepare',
      transactionId: 'transferId',
      source: 'source',
      destination: 'destination'
    }

    const result = Util.EventFramework.getTransferSpanTags({ payload, headers, params }, transactionType, transactionAction)
    assert.deepEqual(result, expectations, 'tags match')
    assert.end()
  })

  test.test('should get tags', assert => {
    const expectations = {
      transactionType: 'transfer',
      transactionAction: 'prepare',
      transactionId: 'transferId',
      source: 'source',
      destination: 'destination'
    }

    const result = Util.EventFramework.getSpanTags(transactionType, transactionAction, expectations.transactionId, expectations.source, expectations.destination)
    assert.deepEqual(result, expectations, 'tags match')
    assert.end()
  })

  test.test('should get query tags', assert => {
    const result = Util.EventFramework.Tags.getQueryTags(
      Enum.Tags.QueryTags.serviceName.accountLookupService,
      Enum.Tags.QueryTags.auditType.transactionFlow,
      Enum.Tags.QueryTags.contentType.httpRequest,
      Enum.Tags.QueryTags.operation.putPartiesByTypeAndID,
      {
        tag1: 'value1'
      }
    )

    const expectations = {
      serviceName: Enum.Tags.QueryTags.serviceName.accountLookupService,
      auditType: Enum.Tags.QueryTags.auditType.transactionFlow,
      contentType: Enum.Tags.QueryTags.contentType.httpRequest,
      operation: Enum.Tags.QueryTags.operation.putPartiesByTypeAndID,
      tag1: 'value1'
    }

    assert.deepEqual(result, expectations, 'tags match')
    assert.end()
  })

  test.end()
})
