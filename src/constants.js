const API_TYPES = Object.freeze({
  fspiop: 'fspiop',
  iso20022: 'iso20022'
})

const ISO_HEADER_PART = 'iso20022'

const CLIENT_ID_HEADER = 'x-client-id'

const REDIS_SUCCESS = 'OK'
const REDIS_IS_CONNECTED_STATUSES = ['connect', 'ready']

const errorMessages = {
  REQUESTED_VERSION_NOT_SUPPORTED: 'The Client requested an unsupported version, see extension list for supported version(s).',
  INVALID_ACCEPT_HEADER: 'Invalid accept header',
  INVALID_CONTENT_TYPE_HEADER: 'Invalid content-type header',
  INVALID_SOURCE_HEADER: 'Invalid fspiop-source header',
  REQUIRE_ACCEPT_HEADER: 'Accept is required',
  REQUIRE_CONTENT_TYPE_HEADER: 'Content-type is required',
  SUPPLIED_VERSION_NOT_SUPPORTED: 'Client supplied a protocol version which is not supported by the server'
}

module.exports = {
  API_TYPES,
  ISO_HEADER_PART,
  CLIENT_ID_HEADER,
  REDIS_SUCCESS,
  REDIS_IS_CONNECTED_STATUSES,
  errorMessages
}
