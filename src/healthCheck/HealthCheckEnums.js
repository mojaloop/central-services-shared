'use strict'

const responseCode = {
  success: 200,
  gatewayTimeout: 502
}

const statusEnum = {
  OK: 'OK',
  DOWN: 'DOWN'
}

const serviceName = {
  participantEndpointService: 'participantEndpointService',
  smtpServer: 'smtpServer',
  datastore: 'datastore',
  broker: 'broker',
  sidecar: 'sidecar',
  cache: 'cache'
}

module.exports = {
  responseCode,
  serviceName,
  statusEnum
}
