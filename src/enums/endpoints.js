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
 * Steven Oderayi <steven.oderayi@modusbox.com>
 --------------
 ******/

const EndpointType = {
  ALARM_NOTIFICATION_URL: 1,
  ALARM_NOTIFICATION_TOPIC: 2,
  FSPIOP_CALLBACK_URL_TRANSFER_POST: 3,
  FSPIOP_CALLBACK_URL_TRANSFER_PUT: 4,
  FSPIOP_CALLBACK_URL_TRANSFER_ERROR: 5
}
// TODO maybe look at combining FspEndpointTypes and FspEndpointTemplates into a single object inclusive of http method
const FspEndpointTypes = {
  FSPIOP_CALLBACK_URL_TRX_REQ_SERVICE: 'FSPIOP_CALLBACK_URL_TRX_REQ_SERVICE',
  FSPIOP_CALLBACK_URL: 'FSPIOP_CALLBACK_URL',
  FSPIOP_CALLBACK_URL_PARTICIPANT_PUT: 'FSPIOP_CALLBACK_URL_PARTICIPANT_PUT',
  FSPIOP_CALLBACK_URL_PARTICIPANT_PUT_ERROR: 'FSPIOP_CALLBACK_URL_PARTICIPANT_PUT_ERROR',
  FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT: 'FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT',
  FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT_ERROR: 'FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT_ERROR',
  FSPIOP_CALLBACK_URL_PARTICIPANT_DELETE: 'FSPIOP_CALLBACK_URL_PARTICIPANT_DELETE',
  FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_DELETE: 'FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_DELETE',
  FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT: 'FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT',
  FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT_ERROR: 'FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT_ERROR',
  FSPIOP_CALLBACK_URL_PARTIES_GET: 'FSPIOP_CALLBACK_URL_PARTIES_GET',
  FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_GET: 'FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_GET',
  FSPIOP_CALLBACK_URL_PARTIES_PUT: 'FSPIOP_CALLBACK_URL_PARTIES_PUT',
  FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT: 'FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT',
  FSPIOP_CALLBACK_URL_PARTIES_PUT_ERROR: 'FSPIOP_CALLBACK_URL_PARTIES_PUT_ERROR',
  FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT_ERROR: 'FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT_ERROR',
  FSPIOP_CALLBACK_URL_TRANSFER_POST: 'FSPIOP_CALLBACK_URL_TRANSFER_POST',
  FSPIOP_CALLBACK_URL_TRANSFER_PUT: 'FSPIOP_CALLBACK_URL_TRANSFER_PUT',
  FSPIOP_CALLBACK_URL_TRANSFER_ERROR: 'FSPIOP_CALLBACK_URL_TRANSFER_ERROR',
  ALARM_NOTIFICATION_URL: 'ALARM_NOTIFICATION_URL',
  ALARM_NOTIFICATION_TOPIC: 'ALARM_NOTIFICATION_TOPIC',
  NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL: 'NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL',
  NET_DEBIT_CAP_ADJUSTMENT_EMAIL: 'NET_DEBIT_CAP_ADJUSTMENT_EMAIL',
  SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL: 'SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL',
  FSPIOP_CALLBACK_URL_QUOTES: 'FSPIOP_CALLBACK_URL_QUOTES',
  FSPIOP_CALLBACK_URL_BULK_TRANSFER_POST: 'FSPIOP_CALLBACK_URL_BULK_TRANSFER_POST',
  FSPIOP_CALLBACK_URL_BULK_TRANSFER_PUT: 'FSPIOP_CALLBACK_URL_BULK_TRANSFER_PUT',
  FSPIOP_CALLBACK_URL_BULK_TRANSFER_ERROR: 'FSPIOP_CALLBACK_URL_BULK_TRANSFER_ERROR',
  FSPIOP_CALLBACK_URL_AUTHORIZATIONS: 'FSPIOP_CALLBACK_URL_AUTHORIZATIONS'
}

const FspEndpointTemplates = {
  TRANSACTION_REQUEST_POST: '/transactionRequests',
  TRANSACTION_REQUEST_PUT: '/transactionRequests/{{ID}}',
  TRANSACTION_REQUEST_GET: '/transactionRequests/{{ID}}',
  TRANSACTION_REQUEST_PUT_ERROR: '/transactionRequests/{{ID}}/error',
  PARTICIPANT_ENDPOINTS_GET: '/participants/{{fsp}}/endpoints',
  PARTICIPANTS_GET: '/participants/{{fsp}}',
  PARTIES_GET: '/parties/{{fsp}}',
  PARTIES_PUT_ERROR: '/parties/{{partyIdType}}/{{partyIdentifier}}/error',
  PARTIES_SUB_ID_PUT_ERROR: '/parties/{{partyIdType}}/{{partyIdentifier}}/{{partySubIdOrType}}/error',
  ORACLE_PARTICIPANTS_TYPE_ID: '/participants/{{partyIdType}}/{{partyIdentifier}}',
  ORACLE_PARTICIPANTS_TYPE_ID_CURRENCY: '/participants/{{partyIdType}}/{{partyIdentifier}}?currency={{currency}}',
  ORACLE_PARTICIPANTS_TYPE_ID_SUB_ID: '/participants/{{partyIdType}}/{{partyIdentifier}}?partySubIdOrType={{partySubIdOrType}}',
  ORACLE_PARTICIPANTS_TYPE_ID_CURRENCY_SUB_ID: '/participants/{{partyIdType}}/{{partyIdentifier}}?currency={{currency}}&partySubIdOrType={{partySubIdOrType}}',
  ORACLE_PARTICIPANTS_BATCH: '/participants',
  TRANSFERS_POST: '/transfers',
  TRANSFERS_PUT: '/{{fsp}}/transfers/{{ID}}',
  TRANSFERS_PUT_ERROR: '/{{fsp}}/transfers/{{ID}}/error',
  BULK_TRANSFERS_POST: '/bulkTransfers',
  BULK_TRANSFERS_PUT: '/{{fsp}}/bulkTransfers/{{ID}}',
  BULK_TRANSFERS_PUT_ERROR: '/{{fsp}}/bulkTransfers/{{ID}}/error'
}

module.exports = {
  EndpointType,
  FspEndpointTypes,
  FspEndpointTemplates
}
