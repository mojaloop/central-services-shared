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

 * Georgi Georgiev <georgi.georgiev@modusbox.com>
 * Shashikant Hirugade <shashikant.hirugade@modusbox.com>
 * Rajiv Mothilal <rajiv.mothilal@modusbox.com>
 * Miguel de Barros <miguel.debarros@modusbox.com>
 --------------
 ******/
const Events = require('./events')
const transferEventType = Events.Event.Type
const transferEventAction = Events.Event.Action

const Config = {
  PRODUCER: 'PRODUCER',
  CONSUMER: 'CONSUMER'
}

const Topics = {
  NOTIFICATION: 'notification',
  POSITION: 'position',
  EVENT: 'event',
  TRANSFER: 'transfer'
}

const TopicMap = {
  'bulk-processing': {
    'bulk-commit': {
      functionality: transferEventType.BULK,
      action: transferEventAction.PROCESSING
    },
    'bulk-abort': {
      functionality: transferEventType.BULK,
      action: transferEventAction.PROCESSING
    },
    'bulk-prepare': {
      functionality: transferEventType.BULK,
      action: transferEventAction.PROCESSING
    },
    'bulk-timeout-received': {
      functionality: transferEventType.BULK,
      action: transferEventAction.PROCESSING
    },
    'bulk-timeout-reserved': {
      functionality: transferEventType.BULK,
      action: transferEventAction.PROCESSING
    },
    'fulfil-duplicate': {
      functionality: transferEventType.BULK,
      action: transferEventAction.PROCESSING
    },
    'prepare-duplicate': {
      functionality: transferEventType.BULK,
      action: transferEventAction.PROCESSING
    }
  },
  fulfil: {
    'bulk-commit': {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.FULFIL
    },
    'bulk-abort': {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.FULFIL
    }
  },
  notification: {
    abort: {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'abort-duplicate': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'abort-validation': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'bulk-abort': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'bulk-commit': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'bulk-prepare': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'bulk-prepare-duplicate': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'bulk-processing': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    commit: {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'fulfil-duplicate': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    get: {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'fx-get': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'fx-notify': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'bulk-get': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'limit-adjustment': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    position: {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    prepare: {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    forwarded: {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'fx-abort': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'fx-abort-duplicate': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'fx-abort-validation': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'fx-commit': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'fx-forwarded': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'fx-fulfil-duplicate': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'fx-prepare': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'fx-prepare-duplicate': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'fx-reject': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'fx-reserve': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'fx-timeout-received': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'fx-timeout-reserved': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'prepare-duplicate': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    reject: {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    reserve: {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'reserved-aborted': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'settlement-window': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'timeout-received': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'timeout-reserved': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    }
  },
  position: {
    'bulk-commit': {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.POSITION
    },
    'bulk-abort': {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.POSITION
    },
    'bulk-prepare': {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.POSITION
    },
    'bulk-timeout-received': {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.POSITION
    },
    'bulk-timeout-reserved': {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.POSITION
    },
    'fx-abort': {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.POSITION
    },
    'fx-abort-validation': {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.POSITION
    },
    'fx-commit': {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.POSITION
    },
    'fx-prepare': {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.POSITION
    },
    'fx-reject': {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.POSITION
    },
    'fx-reserve': {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.POSITION
    },
    prepare: {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.POSITION
    },
    commit: {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.POSITION
    },
    'timeout-reserved': {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.POSITION
    },
    'fx-timeout-reserved': {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.POSITION
    },
    reject: {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.POSITION
    },
    reserve: {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.POSITION
    },
    abort: {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.POSITION
    },
    'abort-validation': {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.POSITION
    }
  },
  prepare: {
    'bulk-prepare': {
      functionality: transferEventType.TRANSFER,
      action: transferEventAction.PREPARE
    }
  }
}

module.exports = {
  Config,
  Topics,
  TopicMap
}
