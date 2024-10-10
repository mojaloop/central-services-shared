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

 * ModusBox
 - Georgi Georgiev <georgi.georgiev@modusbox.com>
 - Lazola Lucas <lazola.lucas@modusbox.com>
 --------------
 ******/
'use strict';

const SettlementWindowState = {
  OPEN: 'OPEN',
  PROCESSING: 'PROCESSING',
  CLOSED: 'CLOSED'
};

const SettlementDelayName = {
  IMMEDIATE: 'IMMEDIATE',
  DEFERRED: 'DEFERRED'
};

const SettlementDelay = {
  IMMEDIATE: 1,
  DEFERRED: 2
};

const settlementGranularityName = {
  GROSS: 'GROSS',
  NET: 'NET'
};

const SettlementGranularity = {
  GROSS: 1,
  NET: 2
};

const SettlementInterchangeName = {
  BILATERAL: 'BILATERAL',
  MULTILATERAL: 'MULTILATERAL'
};

const SettlementInterchange = {
  BILATERAL: 1,
  MULTILATERAL: 2
};

const ValidSettlementModels = [
  { settlementDelay: SettlementDelayName.IMMEDIATE, settlementGranularity: settlementGranularityName.GROSS, settlementInterchange: SettlementInterchangeName.BILATERAL },
  { settlementDelay: SettlementDelayName.DEFERRED, settlementGranularity: settlementGranularityName.GROSS, settlementInterchange: SettlementInterchangeName.BILATERAL },
  { settlementDelay: SettlementDelayName.DEFERRED, settlementGranularity: settlementGranularityName.NET, settlementInterchange: SettlementInterchangeName.BILATERAL },
  { settlementDelay: SettlementDelayName.DEFERRED, settlementGranularity: settlementGranularityName.NET, settlementInterchange: SettlementInterchangeName.MULTILATERAL }
];
const isActiveText = {
  activated: 'activated',
  disabled: 'disabled'
};
const booleanType = {
  0: false,
  1: true
};

export {
  SettlementWindowState,
  SettlementDelayName,
  SettlementDelay,
  settlementGranularityName,
  SettlementGranularity,
  SettlementInterchangeName,
  SettlementInterchange,
  ValidSettlementModels,
  isActiveText,
  booleanType
};
