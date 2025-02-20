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

 * Infitx
 - Kalin Krustev <kalin.krustev@infitx.com>

 --------------
 ******/

const crypto = require('crypto')
const { monotonicFactory, ulid } = require('ulidx')

const generators = {
  // generate UUID compliant with https://datatracker.ietf.org/doc/html/rfc9562
  uuid: ({ version = 7 }) => ({
    4: crypto.randomUUID,
    7: () => {
      const timestamp = Date.now().toString(16).padStart(12, 0)
      const random = crypto.randomUUID()
      return `${timestamp.substring(0, 8)}-${timestamp.substring(8, 12)}-7${random.substring(15, 36)}`
    }
  })[version],
  // monotonic parameter ensures ULIDs are generated in order when called at the same or older seed millisecond
  ulid: ({ monotonic = true }) => monotonic ? monotonicFactory() : ulid
}

module.exports = ({ type = 'uuid', ...config } = {}) => generators[type](config)
