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

const TransferInternalState = {
  ABORTED_ERROR: 'ABORTED_ERROR',
  ABORTED_REJECTED: 'ABORTED_REJECTED',
  COMMITTED: 'COMMITTED',
  EXPIRED_PREPARED: 'EXPIRED_PREPARED',
  EXPIRED_RESERVED: 'EXPIRED_RESERVED',
  FAILED: 'FAILED',
  INVALID: 'INVALID',
  RECEIVED_ERROR: 'RECEIVED_ERROR',
  RECEIVED_FULFIL: 'RECEIVED_FULFIL',
  RECEIVED_FULFIL_DEPENDENT: 'RECEIVED_FULFIL_DEPENDENT',
  RECEIVED_PREPARE: 'RECEIVED_PREPARE',
  RECEIVED_REJECT: 'RECEIVED_REJECT',
  RESERVED: 'RESERVED',
  RESERVED_TIMEOUT: 'RESERVED_TIMEOUT'
}

const TransferState = {
  RECEIVED: 'RECEIVED',
  ABORTED: 'ABORTED',
  COMMITTED: 'COMMITTED',
  RESERVED: 'RESERVED',
  SETTLED: 'SETTLED'
}

const BulkProcessingState = {
  RECEIVED: 1,
  RECEIVED_DUPLICATE: 2,
  RECEIVED_INVALID: 3,
  ACCEPTED: 4,
  PROCESSING: 5,
  FULFIL_DUPLICATE: 6,
  FULFIL_INVALID: 7,
  COMPLETED: 8,
  REJECTED: 9,
  EXPIRED: 10,
  ABORTING: 11
}

const BulkTransferState = {
  ABORTING: 'ABORTING',
  ACCEPTED: 'ACCEPTED',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
  EXPIRING: 'EXPIRING',
  INVALID: 'INVALID',
  PENDING_FULFIL: 'PENDING_FULFIL',
  PENDING_INVALID: 'PENDING_INVALID',
  PENDING_PREPARE: 'PENDING_PREPARE',
  PROCESSING: 'PROCESSING',
  RECEIVED: 'RECEIVED',
  REJECTED: 'REJECTED'
}

const BulkTransferStateEnum = {
  ACCEPTED: 'ACCEPTED',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'COMPLETED',
  EXPIRING: 'PROCESSING',
  INVALID: 'REJECTED',
  PENDING_FULFIL: 'PROCESSING',
  PENDING_INVALID: 'PENDING',
  PENDING_PREPARE: 'PENDING',
  PROCESSING: 'PROCESSING',
  RECEIVED: 'RECEIVED',
  REJECTED: 'REJECTED'
}

const AdminTransferAction = {
  RECORD_FUNDS_IN: 'recordFundsIn',
  RECORD_FUNDS_OUT_PREPARE_RESERVE: 'recordFundsOutPrepareReserve',
  RECORD_FUNDS_OUT_COMMIT: 'recordFundsOutCommit',
  RECORD_FUNDS_OUT_ABORT: 'recordFundsOutAbort'
}

const AdminNotificationActions = {
  LIMIT_ADJUSTMENT: 'limit-adjustment'
}

module.exports = {
  TransferInternalState,
  TransferState,
  BulkProcessingState,
  BulkTransferState,
  BulkTransferStateEnum,
  AdminTransferAction,
  AdminNotificationActions
}
