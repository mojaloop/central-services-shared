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
 --------------
 ******/

const BulkTransferEvent = {
  Type: {},
  Action: {
    BULK_PREPARE: 'bulk-prepare',
    BULK_COMMIT: 'bulk-commit'
  }
}

const TransferEvent = {
  Type: {
    PREPARE: 'prepare',
    POSITION: 'position',
    TRANSFER: 'transfer',
    FULFIL: 'fulfil',
    NOTIFICATION: 'notification',
    ADMIN: 'admin',
    GET: 'get'
  },
  Action: {
    PREPARE: 'prepare',
    PREPARE_DUPLICATE: 'prepare-duplicate',
    FULFIL_DUPLICATE: 'fulfil-duplicate',
    ABORT_DUPLICATE: 'abort-duplicate',
    TRANSFER: 'transfer',
    COMMIT: 'commit',
    ABORT: 'abort',
    TIMEOUT_RECEIVED: 'timeout-received',
    TIMEOUT_RESERVED: 'timeout-reserved',
    REJECT: 'reject',
    FAIL: 'fail',
    EVENT: 'event',
    FULFIL: 'fulfil',
    POSITION: 'position',
    GET: 'get'
  }
}

const AdminTransferEvent = {
  Type: {},
  Action: {
    RECORD_FUNDS_IN: 'recordFundsIn',
    RECORD_FUNDS_OUT_PREPARE_RESERVE: 'recordFundsOutPrepareReserve',
    RECORD_FUNDS_OUT_COMMIT: 'recordFundsOutCommit',
    RECORD_FUNDS_OUT_ABORT: 'recordFundsOutAbort'
  }
}

const AdminNotificationEvent = {
  Type: {},
  Action: {
    LIMIT_ADJUSTMENT: 'limit-adjustment'
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
  commit: 'C',
  get: 'G',
  prepare: 'P',
  reject: 'R',
  timeout: 'T',
  unknown: '?'
}

module.exports = {
  BulkTransferEvent,
  TransferEvent,
  AdminTransferEvent,
  AdminNotificationEvent,
  EventStatus,
  ActionLetter
}
