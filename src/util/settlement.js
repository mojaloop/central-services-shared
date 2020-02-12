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
 * Name Surname <name.surname@gatesfoundation.com>

 * ModusBox
 - Georgi Georgiev <georgi.georgiev@modusbox.com>
 --------------
 ******/
'use strict'

const SettlementEnum = require('../../src/enums/settlements')
const Util = require('../../src/util/index')

const reasons = []

const validateSettlementModel = (delay, granularity, interchange) => {
  let isValid = true
  let settlementDelay
  let settlementGranularity
  let settlementInterchange

  const SettlementDelayTransposed = Util.transpose(SettlementEnum.SettlementDelay)
  const SettlementGranularityTransposed = Util.transpose(SettlementEnum.SettlementGranularity)
  const SettlementInterchangeTransposed = Util.transpose(SettlementEnum.SettlementInterchange)

  if (SettlementEnum.SettlementDelay[delay]) {
    settlementDelay = delay
  } else if (SettlementDelayTransposed[delay]) {
    settlementDelay = SettlementDelayTransposed[delay]
  } else {
    reasons.push('Invalid settlement delay value')
    isValid = false
  }
  if (SettlementEnum.SettlementGranularity[granularity]) {
    settlementGranularity = granularity
  } else if (SettlementGranularityTransposed[granularity]) {
    settlementGranularity = SettlementGranularityTransposed[granularity]
  } else {
    reasons.push('Invalid settlement granularity value')
    isValid = false
  }
  if (SettlementEnum.SettlementInterchange[interchange]) {
    settlementInterchange = interchange
  } else if (SettlementInterchangeTransposed[interchange]) {
    settlementInterchange = SettlementInterchangeTransposed[interchange]
  } else {
    reasons.push('Invalid settlement interchange value')
    isValid = false
  }
  if (isValid) {
    const found = SettlementEnum.ValidSettlementModels.find(model => {
      return settlementDelay === model.settlementDelay &&
        settlementGranularity === model.settlementGranularity &&
        settlementInterchange === model.settlementInterchange
    })
    if (!found) {
      reasons.push('Invalid settlement model definition - delay-granularity-interchange combination is not supported')
      isValid = false
    }
  }

  return { isValid, reasons }
}

module.exports = {
  validateSettlementModel
}
