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

 * Neal Donnan <neal.donnan@modusbox.com>
 --------------
 ******/

const RouteTags = {
  SAMPLED: 'sampled'
}

const QueryTags = {
  serviceName: {
    accountLookupService: 'account-lookup-service',
    accountLookupServiceAdmin: 'account-lookup-service-admin',
    mlApiAdapterService: 'ml-api-adapter-service',
    mlNotificationHandler: 'ml-notification-handler',
    quotingService: 'quoting-service',
    quotingServiceHandler: 'quoting-service-handler'
  },
  auditType: {
    transactionFlow: 'transactionFlow',
    partyOnboarding: 'partyOnboarding',
    oracleAdmin: 'oracleAdmin'
  },
  contentType: {
    kafkaMessage: 'kafkaMessage',
    httpRequest: 'httpRequest'
  },
  operation: {
    getParticipantsByTypeAndID: 'getParticipantsByTypeAndID',
    putParticipantsByTypeAndID: 'putParticipantsByTypeAndID',
    postParticipantsByTypeAndID: 'postParticipantsByTypeAndID',
    deleteParticipantsByTypeAndID: 'deleteParticipantsByTypeAndID',
    postParticipantsBatch: 'postParticipantsBatch',
    getPartiesByTypeAndID: 'getPartiesByTypeAndID',
    putPartiesByTypeAndID: 'putPartiesByTypeAndID',
    getPartiesByTypeIDAndSubID: 'getPartiesByTypeIDAndSubID',
    putPartiesByTypeIDAndSubID: 'putPartiesByTypeIDAndSubID',
    putPartiesErrorByTypeAndID: 'putPartiesErrorByTypeAndID',
    putPartiesErrorByTypeIDAndSubID: 'putPartiesErrorByTypeIDAndSubID',
    putParticipantsErrorByTypeAndID: 'putParticipantsErrorByTypeAndID',
    getParticipantsByTypeIdAndSubID: 'getParticipantsByTypeIdAndSubID',
    putParticipantsByTypeIDAndSubID: 'putParticipantsByTypeIDAndSubID',
    postParticipantsByTypeIDAndSubID: 'postParticipantsByTypeIDAndSubID',
    deleteParticipantsByTypeIDAndSubID: 'deleteParticipantsByTypeIDAndSubID',
    timeoutInterschemePartiesLookups: 'timeoutInterschemePartiesLookups',
    getOracle: 'getOracle',
    createOracle: 'createOracle',
    updateOracle: 'updateOracle',
    deleteOracle: 'deleteOracle',
    getTransferByID: 'getTransferByID',
    getFxTransferByID: 'getFxTransferByID',
    prepareTransfer: 'prepareTransfer',
    prepareFxTransfer: 'prepareFxTransfer',
    prepareTransferError: 'prepareTransferError',
    prepareFxTransferError: 'prepareFxTransferError',
    prepareTransferDuplicate: 'prepareTransferDuplicate',
    prepareFxTransferDuplicate: 'prepareFxTransferDuplicate',
    commitTransfer: 'commitTransfer',
    commitFxTransfer: 'commitFxTransfer',
    reserveTransfer: 'reserveTransfer',
    reserveFxTransfer: 'reserveFxTransfer',
    reservedAbortedTransfer: 'reservedAbortedTransfer',
    reservedAbortedFxTransfer: 'reservedAbortedFxTransfer',
    rejectTransfer: 'rejectTransfer',
    rejectFxTransfer: 'rejectFxTransfer',
    abortTransfer: 'abortTransfer',
    abortFxTransfer: 'abortFxTransfer',
    abortTransferValidation: 'abortTransferValidation',
    abortFxTransferValidation: 'abortFxTransferValidation',
    abortDuplicateTransfer: 'abortDuplicateTransfer',
    abortDuplicateFxTransfer: 'abortDuplicateFxTransfer',
    fulfilTransfer: 'fulfilTransfer',
    fulfilFxTransfer: 'fulfilFxTransfer',
    fulfilDuplicateTransfer: 'fulfilDuplicateTransfer',
    fulfilDuplicateFxTransfer: 'fulfilDuplicateFxTransfer',
    timeoutReceived: 'timeoutReceived',
    fxTimeoutReceived: 'fxTimeoutReceived',
    timeoutReserved: 'timeoutReserved',
    fxTimeoutReserved: 'fxTimeoutReserved',
    forwardedTransfer: 'forwardedTransfer',
    forwardedFxTransfer: 'forwardedFxTransfer',
    notifyFxTransfer: 'notifyFxTransfer',
    postQuotes: 'postQuotes',
    putQuotesByID: 'putQuotesByID',
    putQuotesErrorByID: 'putQuotesErrorByID',
    getQuotesByID: 'getQuotesByID',
    postFxQuotes: 'postFxQuotes',
    putFxQuotesByID: 'putFxQuotesByID',
    putFxQuotesErrorByID: 'putFxQuotesErrorByID',
    getFxQuotesByID: 'getFxQuotesByID',
    postBulkQuotes: 'postBulkQuotes',
    putBulkQuotesByID: 'putBulkQuotesByID',
    putBulkQuotesErrorByID: 'putBulkQuotesErrorByID',
    getBulkQuotesByID: 'getBulkQuotesByID'
  }
}

module.exports = {
  RouteTags,
  QueryTags
}
