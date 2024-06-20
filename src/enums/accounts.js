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

const LedgerAccountType = {
  POSITION: 1,
  SETTLEMENT: 2,
  HUB_RECONCILIATION: 3,
  HUB_MULTILATERAL_SETTLEMENT: 4,
  HUB_FEE: 5,
  POSITION_REMITTANCE: 7,
  SETTLEMENT_REMITTANCE: 8
}

const LedgerEntryType = {
  PRINCIPLE_VALUE: 1,
  INTERCHANGE_FEE: 2,
  HUB_FEE: 3,
  POSITION_DEPOSIT: 4,
  POSITION_WITHDRAWAL: 5,
  SETTLEMENT_NET_RECIPIENT: 6,
  SETTLEMENT_NET_SENDER: 7,
  SETTLEMENT_NET_ZERO: 8,
  SETTLEMENT_ACCOUNT_DEPOSIT: 9,
  SETTLEMENT_ACCOUNT_WITHDRAWAL: 10
}

const ParticipantLimitType = {
  NET_DEBIT_CAP: 1
}

const TransferParticipantRoleType = {
  PAYER_DFSP: 1,
  PAYEE_DFSP: 2,
  HUB: 3,
  DFSP_SETTLEMENT: 4,
  DFSP_POSITION: 5,
  INITIATING_FSP: 6,
  COUNTER_PARTY_FSP: 7
}

const PartyAccountTypes = {
  MSISDN: 'MSISDN',
  EMAIL: 'EMAIL',
  PERSONAL_ID: 'PERSONAL_ID',
  BUSINESS: 'BUSINESS',
  DEVICE: 'DEVICE',
  ACCOUNT_ID: 'ACCOUNT_ID',
  IBAN: 'IBAN',
  ALIAS: 'ALIAS',
  CONSENT: 'CONSENT',
  THIRD_PARTY_LINK: 'THIRD_PARTY_LINK'
}

module.exports = {
  LedgerAccountType,
  LedgerEntryType,
  ParticipantLimitType,
  TransferParticipantRoleType,
  PartyAccountTypes
}
