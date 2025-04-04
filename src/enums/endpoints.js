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
  FSPIOP_CALLBACK_URL_FX_TRANSFER_POST: 'FSPIOP_CALLBACK_URL_FX_TRANSFER_POST',
  FSPIOP_CALLBACK_URL_FX_TRANSFER_PUT: 'FSPIOP_CALLBACK_URL_FX_TRANSFER_PUT',
  FSPIOP_CALLBACK_URL_FX_TRANSFER_ERROR: 'FSPIOP_CALLBACK_URL_FX_TRANSFER_ERROR',
  ALARM_NOTIFICATION_URL: 'ALARM_NOTIFICATION_URL',
  ALARM_NOTIFICATION_TOPIC: 'ALARM_NOTIFICATION_TOPIC',
  NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL: 'NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL',
  NET_DEBIT_CAP_ADJUSTMENT_EMAIL: 'NET_DEBIT_CAP_ADJUSTMENT_EMAIL',
  SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL: 'SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL',
  FSPIOP_CALLBACK_URL_QUOTES: 'FSPIOP_CALLBACK_URL_QUOTES',
  FSPIOP_CALLBACK_URL_FX_QUOTES: 'FSPIOP_CALLBACK_URL_FX_QUOTES',
  FSPIOP_CALLBACK_URL_BULK_QUOTES: 'FSPIOP_CALLBACK_URL_BULK_QUOTES',
  FSPIOP_CALLBACK_URL_BULK_TRANSFER_POST: 'FSPIOP_CALLBACK_URL_BULK_TRANSFER_POST',
  FSPIOP_CALLBACK_URL_BULK_TRANSFER_PUT: 'FSPIOP_CALLBACK_URL_BULK_TRANSFER_PUT',
  FSPIOP_CALLBACK_URL_BULK_TRANSFER_ERROR: 'FSPIOP_CALLBACK_URL_BULK_TRANSFER_ERROR',
  FSPIOP_CALLBACK_URL_AUTHORIZATIONS: 'FSPIOP_CALLBACK_URL_AUTHORIZATIONS',
  TP_CB_URL_TRANSACTION_REQUEST_GET: 'TP_CB_URL_TRANSACTION_REQUEST_GET',
  TP_CB_URL_TRANSACTION_REQUEST_POST: 'TP_CB_URL_TRANSACTION_REQUEST_POST',
  TP_CB_URL_TRANSACTION_REQUEST_PUT: 'TP_CB_URL_TRANSACTION_REQUEST_PUT',
  TP_CB_URL_TRANSACTION_REQUEST_PUT_ERROR: 'TP_CB_URL_TRANSACTION_REQUEST_PUT_ERROR',
  TP_CB_URL_TRANSACTION_REQUEST_PATCH: 'TP_CB_URL_TRANSACTION_REQUEST_PATCH',
  TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST: 'TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST',
  TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT: 'TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT',
  TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT_ERROR: 'TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT_ERROR',
  TP_CB_URL_TRANSACTION_REQUEST_VERIFY_POST: 'TP_CB_URL_TRANSACTION_REQUEST_VERIFY_POST',
  TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT: 'TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT',
  TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT_ERROR: 'TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT_ERROR',
  TP_CB_URL_CONSENT_REQUEST_PATCH: 'TP_CB_URL_CONSENT_REQUEST_PATCH',
  TP_CB_URL_CONSENT_REQUEST_POST: 'TP_CB_URL_CONSENT_REQUEST_POST',
  TP_CB_URL_CONSENT_REQUEST_PUT: 'TP_CB_URL_CONSENT_REQUEST_PUT',
  TP_CB_URL_CONSENT_REQUEST_PUT_ERROR: 'TP_CB_URL_CONSENT_REQUEST_PUT_ERROR',
  TP_CB_URL_CREATE_CREDENTIAL_POST: 'TP_CB_URL_CREATE_CREDENTIAL_POST',
  TP_CB_URL_CONSENT_POST: 'TP_CB_URL_CONSENT_POST',
  TP_CB_URL_CONSENT_GET: 'TP_CB_URL_CONSENT_GET',
  TP_CB_URL_CONSENT_PUT: 'TP_CB_URL_CONSENT_PUT',
  TP_CB_URL_CONSENT_PATCH: 'TP_CB_URL_CONSENT_PATCH',
  TP_CB_URL_CONSENT_PUT_ERROR: 'TP_CB_URL_CONSENT_PUT_ERROR',
  TP_CB_URL_CONSENT_GENERATE_CHALLENGE_POST: 'TP_CB_URL_CONSENT_GENERATE_CHALLENGE_POST',
  TP_CB_URL_CONSENT_GENERATE_CHALLENGE_PUT_ERROR: 'TP_CB_URL_CONSENT_GENERATE_CHALLENGE_PUT_ERROR',
  TP_CB_URL_ACCOUNTS_GET: 'TP_CB_URL_ACCOUNTS_GET',
  TP_CB_URL_ACCOUNTS_PUT: 'TP_CB_URL_ACCOUNTS_PUT',
  TP_CB_URL_ACCOUNTS_PUT_ERROR: 'TP_CB_URL_ACCOUNTS_PUT_ERROR',
  TP_CB_URL_SERVICES_GET: 'TP_CB_URL_SERVICES_GET',
  TP_CB_URL_SERVICES_PUT: 'TP_CB_URL_SERVICES_PUT',
  TP_CB_URL_SERVICES_PUT_ERROR: 'TP_CB_URL_SERVICES_PUT_ERROR'
}

const FspEndpointTemplates = {
  TRANSACTION_REQUEST_POST: '/transactionRequests',
  TRANSACTION_REQUEST_PUT: '/transactionRequests/{{ID}}',
  TRANSACTION_REQUEST_GET: '/transactionRequests/{{ID}}',
  TRANSACTION_REQUEST_PUT_ERROR: '/transactionRequests/{{ID}}/error',
  PARTICIPANT_ENDPOINTS_GET: '/participants/{{fsp}}/endpoints',
  PARTICIPANTS_GET_ALL: '/participants',
  PARTICIPANTS_GET: '/participants/{{fsp}}',
  PARTICIPANTS_POST: '/participants',
  PARTIES_GET: '/parties/{{fsp}}',
  PARTIES_PUT_ERROR: '/parties/{{partyIdType}}/{{partyIdentifier}}/error',
  PARTIES_SUB_ID_PUT_ERROR: '/parties/{{partyIdType}}/{{partyIdentifier}}/{{partySubIdOrType}}/error',
  ORACLE_PARTICIPANTS_TYPE_ID: '/participants/{{partyIdType}}/{{partyIdentifier}}',
  ORACLE_PARTICIPANTS_TYPE_ID_CURRENCY: '/participants/{{partyIdType}}/{{partyIdentifier}}?currency={{currency}}',
  ORACLE_PARTICIPANTS_TYPE_ID_SUB_ID: '/participants/{{partyIdType}}/{{partyIdentifier}}?partySubIdOrType={{partySubIdOrType}}',
  ORACLE_PARTICIPANTS_TYPE_ID_CURRENCY_SUB_ID: '/participants/{{partyIdType}}/{{partyIdentifier}}?currency={{currency}}&partySubIdOrType={{partySubIdOrType}}',
  ORACLE_PARTICIPANTS_BATCH: '/participants',
  FX_TRANSFERS_POST: '/fxTransfers',
  FX_TRANSFERS_PUT: '/{{fsp}}/fxTransfers/{{ID}}',
  FX_TRANSFERS_PUT_ERROR: '/{{fsp}}/fxTransfers/{{ID}}/error',
  FX_QUOTES_POST: '/fxQuotes',
  FX_QUOTES_PUT: '/{{fsp}}/fxQuotes/{{ID}}',
  FX_QUOTES_ERROR_PUT: '/fxQuotes/{{ID}}/error',
  TRANSFERS_POST: '/transfers',
  TRANSFERS_PUT: '/{{fsp}}/transfers/{{ID}}',
  TRANSFERS_PUT_ERROR: '/{{fsp}}/transfers/{{ID}}/error',
  BULK_TRANSFERS_POST: '/bulkTransfers',
  BULK_TRANSFERS_PUT: '/{{fsp}}/bulkTransfers/{{ID}}',
  BULK_TRANSFERS_PUT_ERROR: '/{{fsp}}/bulkTransfers/{{ID}}/error',
  BULK_QUOTES_POST: '/bulkQuotes',
  BULK_QUOTES_ERROR_PUT: '/bulkQuotes/{{bulkQuoteId}}/error',
  TP_TRANSACTION_REQUEST_GET: '/thirdpartyRequests/transactions/{{ID}}',
  TP_TRANSACTION_REQUEST_POST: '/thirdpartyRequests/transactions',
  TP_TRANSACTION_REQUEST_PUT: '/thirdpartyRequests/transactions/{{ID}}',
  TP_TRANSACTION_REQUEST_PUT_ERROR: '/thirdpartyRequests/transactions/{{ID}}/error',
  TP_TRANSACTION_REQUEST_PATCH: '/thirdpartyRequests/transactions/{{ID}}',
  TP_REQUESTS_AUTHORIZATIONS_POST: '/thirdpartyRequests/authorizations',
  TP_REQUESTS_AUTHORIZATIONS_PUT: '/thirdpartyRequests/authorizations/{{ID}}',
  TP_REQUESTS_AUTHORIZATIONS_PUT_ERROR: '/thirdpartyRequests/authorizations/{{ID}}/error',
  TP_REQUESTS_VERIFICATIONS_POST: '/thirdpartyRequests/verifications',
  TP_REQUESTS_VERIFICATIONS_PUT: '/thirdpartyRequests/verifications/{{ID}}',
  TP_REQUESTS_VERIFICATIONS_PUT_ERROR: '/thirdpartyRequests/verifications/{{ID}}/error',
  TP_CONSENT_REQUEST_PATCH: '/consentRequests/{{ID}}',
  TP_CONSENT_REQUEST_POST: '/consentRequests',
  TP_CONSENT_REQUEST_PUT: '/consentRequests/{{ID}}',
  TP_CONSENT_REQUEST_PUT_ERROR: '/consentRequests/{{ID}}/error',
  TP_CONSENT_CREATE_CREDENTIAL_POST: '/consents/{{ID}}/createCredential',
  TP_CONSENT_POST: '/consents',
  TP_CONSENT_GET: '/consents/{{ID}}',
  TP_CONSENT_PUT: '/consents/{{ID}}',
  TP_CONSENT_PATCH: '/consents/{{ID}}',
  TP_CONSENT_PUT_ERROR: '/consents/{{ID}}/error',
  TP_CONSENT_GENERATE_CHALLENGE_POST: '/consents/{{ID}}/generateChallenge',
  TP_CONSENT_GENERATE_CHALLENGE_PUT_ERROR: '/consents/{{ID}}/generateChallenge/error',
  TP_ACCOUNTS_GET: '/accounts/{{ID}}',
  TP_ACCOUNTS_PUT: '/accounts/{{ID}}',
  TP_ACCOUNTS_PUT_ERROR: '/accounts/{{ID}}/error',
  TP_SERVICES_GET: '/services/{{ServiceType}}',
  TP_SERVICES_PUT: '/services/{{ServiceType}}',
  TP_SERVICES_PUT_ERROR: '/services/{{ServiceType}}/error'
}

module.exports = {
  EndpointType,
  FspEndpointTypes,
  FspEndpointTemplates
}
