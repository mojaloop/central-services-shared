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
 * Eugen Klymniuk <eugen.klymniuk@infitx.com>

 --------------
 ******/
/* istanbul ignore file */

const otel = require('@opentelemetry/semantic-conventions')

const ATTR_SERVICE_PEER_NAME = 'service.peer.name' // using string literal because ATTR_SERVICE_PEER_NAME is only available in @opentelemetry/semantic-conventions/incubating as of now
const CUSTOM_REQUEST_ID = 'request.id'

/** @typedef {{ attributes: Record<string, any> }} OTelAttributes */

/** @returns OTelAttributes */
const outgoingRequestAttributesDto = ({
  method, url, durationSec, statusCode, errorType, errorMessage, peerService
}) => {
  const { hostname, port } = parseHostPort(url)
  return {
    attributes: {
      [otel.ATTR_HTTP_REQUEST_METHOD]: method?.toUpperCase(),
      [otel.ATTR_URL_FULL]: url,
      ...(hostname && { [otel.ATTR_SERVER_ADDRESS]: hostname }),
      ...(port && { [otel.ATTR_SERVER_PORT]: port }),
      ...(durationSec != null && { [otel.METRIC_HTTP_CLIENT_REQUEST_DURATION]: durationSec }),
      ...(statusCode != null && { [otel.ATTR_HTTP_RESPONSE_STATUS_CODE]: statusCode }),
      ...(errorType && { [otel.ATTR_ERROR_TYPE]: errorType }),
      ...(errorMessage && { [otel.ATTR_EXCEPTION_MESSAGE]: errorMessage }),
      ...(peerService && { [ATTR_SERVICE_PEER_NAME]: peerService })
      // peerService - logical service name, must be explicitly provided by caller (not derived from URL hostname)
      //               think if we should extract it for internal http://... calls from url hostname
    }
  }
}

/** @returns OTelAttributes */
const incomingRequestAttributesDto = ({
  method, url, path, route, scheme, query,
  serverAddress, serverPort, clientAddress, userAgent,
  durationSec, requestId, statusCode, errorType
}) => ({
  attributes: {
    [otel.ATTR_HTTP_REQUEST_METHOD]: method?.toUpperCase(),
    [otel.ATTR_URL_FULL]: url,
    [otel.ATTR_URL_PATH]: path,
    [otel.ATTR_URL_SCHEME]: scheme,
    [CUSTOM_REQUEST_ID]: requestId,
    ...(route && { [otel.ATTR_HTTP_ROUTE]: route }),
    ...(query && { [otel.ATTR_URL_QUERY]: query }),
    ...(serverAddress && { [otel.ATTR_SERVER_ADDRESS]: serverAddress }),
    ...(serverPort && { [otel.ATTR_SERVER_PORT]: serverPort }),
    ...(clientAddress && { [otel.ATTR_CLIENT_ADDRESS]: clientAddress }),
    ...(userAgent && { [otel.ATTR_USER_AGENT_ORIGINAL]: userAgent }),
    ...(durationSec != null && { [otel.METRIC_HTTP_SERVER_REQUEST_DURATION]: durationSec }),
    ...(statusCode != null && { [otel.ATTR_HTTP_RESPONSE_STATUS_CODE]: statusCode }),
    ...(errorType && { [otel.ATTR_ERROR_TYPE]: errorType })
  }
})

const parseHostPort = (url) => {
  try {
    const { hostname, port, protocol } = new URL(url)
    return {
      hostname,
      port: Number(port) || (protocol === 'https:' ? 443 : 80)
    }
  } catch {
    return {}
  }
}

module.exports = {
  outgoingRequestAttributesDto,
  incomingRequestAttributesDto
}
