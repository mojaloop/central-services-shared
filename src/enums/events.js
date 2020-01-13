/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Georgi Georgiev <georgi.georgiev@modusbox.com> : sourced from ml-api-adapter
 * Miguel de Barros <miguel.debarros@modusbox.com>
 * Rajiv Mothilal <rajiv.mothilal@modusbox.com>
 --------------
 ******/

const Event = {
  Type: {
    ADMIN: 'admin',
    BULK: 'bulk',
    BULK_PROCESSING: 'bulk-processing',
    ENDPOINTCACHE: 'endpointcache',
    EVENT: 'event',
    FULFIL: 'fulfil',
    GET: 'get',
    NOTIFICATION: 'notification',
    ORACLE: 'oracle',
    POSITION: 'position',
    PREPARE: 'prepare',
    QUOTE: 'quote',
    TRANSFER: 'transfer',
    PARTY: 'party',
    PARTICIPANT: 'participant',
    SETTLEMENT_WINDOW: 'settlementwindow'
  },
  Action: {
    ABORT: 'abort',
    ABORT_DUPLICATE: 'abort-duplicate',
    ACCEPT: 'accept',
    BULK_ABORT: 'bulk-abort',
    BULK_COMMIT: 'bulk-commit',
    BULK_PREPARE: 'bulk-prepare',
    BULK_PROCESSING: 'bulk-processing',
    BULK_TIMEOUT_RECEIVED: 'bulk-timeout-received',
    BULK_TIMEOUT_RESERVED: 'bulk-timeout-reserved',
    CLOSE: 'close',
    COMMIT: 'commit',
    CREATE: 'create',
    DELETE: 'delete',
    EVENT: 'event',
    FAIL: 'fail',
    FULFIL: 'fulfil',
    FULFIL_DUPLICATE: 'fulfil-duplicate',
    GET: 'get',
    INITIATE: 'initiate',
    LIMIT_ADJUSTMENT: 'limit-adjustment',
    LOOKUP: 'lookup',
    POSITION: 'position',
    PREPARE: 'prepare',
    PREPARE_DUPLICATE: 'prepare-duplicate',
    PROCESSING: 'processing',
    RECORD_FUNDS_IN: 'recordFundsIn',
    RECORD_FUNDS_OUT_ABORT: 'recordFundsOutAbort',
    RECORD_FUNDS_OUT_COMMIT: 'recordFundsOutCommit',
    RECORD_FUNDS_OUT_PREPARE_RESERVE: 'recordFundsOutPrepareReserve',
    REJECT: 'reject',
    RESOLVE: 'resolve',
    REQUEST: 'request',
    SETTLEMENT_WINDOW: 'settlement-window',
    TIMEOUT_RECEIVED: 'timeout-received',
    TIMEOUT_RESERVED: 'timeout-reserved',
    TRANSFER: 'transfer',
    PUT: 'put',
    POST: 'post'
  }
}

const EventStatus = {
  SUCCESS: {
    status: 'success',
    code: 0,
    description: 'action successful'
  },
  FAILURE: {
    status: 'error',
    code: 999,
    description: 'action failed'
  }
}

const ActionLetter = {
  abort: 'A',
  bulkPrepare: 'BP',
  bulkPrepareDuplicate: 'BPD',
  bulkFulfil: 'BF',
  bulkFulfilDuplicate: 'BFD',
  bulkCommit: 'BC',
  bulkTimeoutReceived: 'BTRc',
  bulkTimeoutReserved: 'BTRs',
  commit: 'C',
  close: 'CL',
  get: 'G',
  prepare: 'P',
  reject: 'R',
  timeout: 'T',
  unknown: '?'
}

const EventState = {
  SUCCESS: 'success',
  ERROR: 'error',
  FAILED: 'failed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
}

module.exports = {
  Event,
  EventStatus,
  ActionLetter,
  EventState
}
