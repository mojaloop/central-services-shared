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
 * Miguel de Barros <miguel.debarros@modusbox.com>
 --------------
 ******/
'use strict'

const Hash = require('../hash')

const duplicateCheckComparator = async (id, objectOrHashOverride, getDuplicateDataFuncOverride, saveHashFuncOverride, options = {
  hashOverride: false
}) => {
  // lets check if we can actually do the comparison
  if (objectOrHashOverride == null) throw Error('objectOrHashOverride arg is null')

  let hasDuplicateId = false
  let hasDuplicateHash = false
  let duplicateHashRecordResult = null
  let saveHashFuncOverrideResult = false

  const generatedHash = options?.hashOverride ? objectOrHashOverride : Hash.generateSha256(objectOrHashOverride) // options.hashOverride is useful for cases where the hash is already provided, such as Bulk Transfers Prepare/Fulfil Use-Case - the hash is calculated in the Bulk-API-Adapter.

  const compareById = async () => {
    duplicateHashRecordResult = await getDuplicateDataFuncOverride(id)
    hasDuplicateId = duplicateHashRecordResult !== null
    return hasDuplicateId
  }

  const compareByHash = () => {
    hasDuplicateHash = duplicateHashRecordResult.hash === generatedHash
    return hasDuplicateHash
  }

  if (await compareById()) {
    compareByHash()
  } else {
    saveHashFuncOverrideResult = await saveHashFuncOverride(id, generatedHash)
  }

  return {
    hasDuplicateId,
    hasDuplicateHash,
    duplicateHashRecordResult,
    saveHashFuncOverrideResult
  }
}

module.exports = duplicateCheckComparator
