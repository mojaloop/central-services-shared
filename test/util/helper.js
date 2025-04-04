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

 *  - Rajiv Mothilal <rajiv.mothilal@modusbox.com>

 --------------
 ******/
'use strict'

const Enums = require('../../src/enums')
const { logger } = require('#src/logger')

const generateProtocolHeader = (resource, version) => `application/vnd.interoperability.${resource}+json;version=${version}`

const defaultHeaders = (destination, resource, source, version = '1.0') => {
  // TODO: See API section 3.2.1; what should we do about X-Forwarded-For? Also, should we
  // add/append to this field in all 'queueResponse' calls?
  return {
    accept: generateProtocolHeader(resource, version),
    'fspiop-destination': destination || '',
    'content-type': generateProtocolHeader(resource, version),
    date: '2019-05-24 08:52:19',
    'fspiop-source': source
  }
}

const getParticipantsResponseError = {
  data: {
    errorInformation: {
      errorCode: '3200',
      errorDescription: 'Generic ID not found - The requested resource could not be found.'
    }
  }
}

const getParticipantsResponseFsp1 = {
  data: {
    name: 'fsp1',
    id: 'http://central-ledger/participants/fsp1',
    created: '"2023-11-07T21:52:25.000Z"',
    isActive: 1,
    links: { self: 'http://central-ledger/participants/fsp1' },
    accounts: [
      { id: 7, ledgerAccountType: 'POSITION', currency: 'USD', isActive: 1, createdDate: null, createdBy: 'unknown' },
      { id: 8, ledgerAccountType: 'SETTLEMENT', currency: 'USD', isActive: 1, createdDate: null, createdBy: 'unknown' }
    ]
  }
}

const getParticipantsResponseFsp2 = {
  data: {
    name: 'fsp2',
    id: 'http://central-ledger/participants/fsp2',
    created: '"2023-11-07T21:52:25.000Z"',
    isActive: 1,
    links: { self: 'http://central-ledger/participants/fsp2' },
    accounts: [
      { id: 9, ledgerAccountType: 'POSITION', currency: 'USD', isActive: 1, createdDate: null, createdBy: 'unknown' },
      { id: 10, ledgerAccountType: 'SETTLEMENT', currency: 'USD', isActive: 1, createdDate: null, createdBy: 'unknown' }
    ]
  }
}
const getEndPointsResponse = {
  data: [
    {
      type: Enums.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TRANSFER_POST,
      value: 'http://localhost:1080/transfers'
    },
    {
      type: Enums.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TRANSFER_PUT,
      value: 'http://localhost:1080/transfers/{{transferId}}'
    },
    {
      type: Enums.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TRANSFER_ERROR,
      value: 'http://localhost:1080/transfers/{{transferId}}/error'
    }
  ]
}

const getEndpointAndRenderResponse = {
  data: [
    {
      type: Enums.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TRANSFER_POST,
      value: 'http://localhost:1080/'
    },
    {
      type: Enums.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TRANSFER_PUT,
      value: 'http://localhost:1080/'
    },
    {
      type: Enums.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TRANSFER_ERROR,
      value: 'http://localhost:1080/'
    }
  ]
}

// to use as a wrapper on Tape tests
const tryCatchEndTest = (testFn) => async (t) => {
  try {
    await testFn(t)
  } catch (err) {
    logger.error(`error in test "${t.name}":`, err)
    t.fail(`${t.name} failed due to error: ${err?.message}`)
  }
  t.end()
}

module.exports = {
  defaultHeaders,
  generateProtocolHeader,
  getEndPointsResponse,
  getEndpointAndRenderResponse,
  getParticipantsResponseFsp1,
  getParticipantsResponseFsp2,
  getParticipantsResponseError,
  tryCatchEndTest
}
