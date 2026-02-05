const otel = require('@opentelemetry/semantic-conventions')

const ATTR_SERVICE_PEER_NAME = 'service.peer.name' // using string literal because ATTR_SERVICE_PEER_NAME is only available in @opentelemetry/semantic-conventions/incubating as of now

// peerService - logical service name, must be explicitly provided by caller (not derived from URL hostname)
const outgoingRequestDto = ({
  method, url, durationSec, statusCode, errorType, peerService
}) => ({
  [otel.ATTR_HTTP_REQUEST_METHOD]: method,
  [otel.ATTR_URL_FULL]: url,
  [otel.METRIC_HTTP_CLIENT_REQUEST_DURATION]: durationSec, // 'duration.ms' is a custom attribute
  ...(statusCode && { [otel.ATTR_HTTP_RESPONSE_STATUS_CODE]: statusCode }),
  ...(errorType && { [otel.ATTR_ERROR_TYPE]: errorType }),
  ...(peerService && { [ATTR_SERVICE_PEER_NAME]: peerService }) // think if we should to extract it for internal http://... calls from hostname
})

const incomingRequestDto = () => ({}) // todo: add impl.

module.exports = {
  outgoingRequestDto,
  incomingRequestDto
}
