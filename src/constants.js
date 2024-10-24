const API_TYPES = Object.freeze({
  fspiop: 'fspiop',
  iso20022: 'iso20022'
})

const ISO_HEADER_PART = 'iso20022'

const REDIS_SUCCESS = 'OK'
const REDIS_IS_CONNECTED_STATUSES = ['connect', 'ready']

module.exports = {
  API_TYPES,
  ISO_HEADER_PART,
  REDIS_SUCCESS,
  REDIS_IS_CONNECTED_STATUSES
}
