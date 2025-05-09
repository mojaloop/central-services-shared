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

 * Georgi Georgiev <georgi.georgiev@modusbox.com> : sourced from ml-api-adapter
 * Miguel de Barros <miguel.debarros@modusbox.com>
 * Rajiv Mothilal <rajiv.mothilal@modusbox.com>
 --------------
 ******/

const Event = {
  Type: {
    ADMIN: 'admin',
    AUTHORIZATION: 'authorization',
    ACCOUNT: 'account',
    BULK: 'bulk',
    BULK_QUOTE: 'bulkquote',
    BULK_PROCESSING: 'bulk-processing',
    BULK_PREPARE: 'bulk-prepare',
    BULK_FULFIL: 'bulk-fulfil',
    CONSENT: 'consent',
    CONSENT_REQUEST: 'consent-request',
    ENDPOINTCACHE: 'endpointcache',
    EVENT: 'event',
    FULFIL: 'fulfil',
    FX_QUOTE: 'fxquote',
    FX_TRANSFER: 'fxtransfer',
    GET: 'get',
    NOTIFICATION: 'notification',
    ORACLE: 'oracle',
    POSITION: 'position',
    PREPARE: 'prepare',
    QUOTE: 'quote',
    SERVICE: 'service',
    SETTLEMENT: 'settlement',
    SETTLEMENT_WINDOW: 'settlementwindow',
    THIRDPARTY: 'thirdparty',
    TRANSACTION_REQUEST: 'transaction-request',
    TRANSFER: 'transfer',
    PARTY: 'party',
    PARTICIPANT: 'participant',
    DEFERRED_SETTLEMENT: 'deferredsettlement',
    GROSS_SETTLEMENT: 'transfersettlement',
    VERIFICATION: 'verification'
  },
  Action: {
    ABORT: 'abort',
    ABORT_DUPLICATE: 'abort-duplicate',
    ABORT_VALIDATION: 'abort-validation',
    ACCEPT: 'accept',
    BULK_ABORT: 'bulk-abort',
    BULK_COMMIT: 'bulk-commit',
    BULK_PREPARE: 'bulk-prepare',
    BULK_PREPARE_DUPLICATE: 'bulk-prepare-duplicate',
    BULK_PROCESSING: 'bulk-processing',
    BULK_TIMEOUT_RECEIVED: 'bulk-timeout-received',
    BULK_TIMEOUT_RESERVED: 'bulk-timeout-reserved',
    BULK_GET: 'bulk-get',
    CLOSE: 'close',
    COMMIT: 'commit',
    CREATE: 'create',
    DELETE: 'delete',
    EVENT: 'event',
    FAIL: 'fail',
    FULFIL: 'fulfil',
    FULFIL_DUPLICATE: 'fulfil-duplicate',
    FX_FULFIL: 'fx-fulfil',
    FX_ABORT: 'fx-abort',
    FX_COMMIT: 'fx-commit',
    FX_PREPARE: 'fx-prepare',
    FX_REJECT: 'fx-reject',
    FX_RESERVE: 'fx-reserve',
    FX_PREPARE_DUPLICATE: 'fx-prepare-duplicate',
    FX_ABORT_VALIDATION: 'fx-abort-validation',
    FX_RESERVED_ABORTED: 'fx-reserved-aborted',
    FX_FORWARDED: 'fx-forwarded',
    FX_FULFIL_DUPLICATE: 'fx-fulfil-duplicate',
    FX_ABORT_DUPLICATE: 'fx-abort-duplicate',
    FX_TIMEOUT_RECEIVED: 'fx-timeout-received',
    FX_TIMEOUT_RESERVED: 'fx-timeout-reserved',
    FX_GET: 'fx-get',
    FX_NOTIFY: 'fx-notify',
    GET: 'get',
    INITIATE: 'initiate',
    LIMIT_ADJUSTMENT: 'limit-adjustment',
    LOOKUP: 'lookup',
    POSITION: 'position',
    POSITION_PREPARE: 'position-prepare',
    POSITION_FULFIL: 'position-fulfil',
    PREPARE: 'prepare',
    FORWARDED: 'forwarded',
    PREPARE_DUPLICATE: 'prepare-duplicate',
    PROCESSING: 'processing',
    RECORD_FUNDS_IN: 'recordFundsIn',
    RECORD_FUNDS_OUT_ABORT: 'recordFundsOutAbort',
    RECORD_FUNDS_OUT_COMMIT: 'recordFundsOutCommit',
    RECORD_FUNDS_OUT_PREPARE_RESERVE: 'recordFundsOutPrepareReserve',
    REJECT: 'reject',
    RESOLVE: 'resolve',

    // The Transfer was marked as RESERVED by the payee DFSP
    // and was then aborted by the switch
    RESERVED_ABORTED: 'reserved-aborted',
    REQUEST: 'request',
    RESERVE: 'reserve',
    SETTLEMENT_WINDOW: 'settlement-window',
    TIMEOUT_RECEIVED: 'timeout-received',
    TIMEOUT_RESERVED: 'timeout-reserved',
    TRANSFER: 'transfer',
    PATCH: 'patch',
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
  bulkAbort: 'BA',
  bulkTimeoutReceived: 'BTRc',
  bulkTimeoutReserved: 'BTRs',
  commit: 'C',
  close: 'CL',
  get: 'G',
  prepare: 'P',
  reject: 'R',
  reserve: 'Rs',
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
